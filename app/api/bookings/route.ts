import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('user_id');
    const db = getDb();

    let query = `
      SELECT 
        b.*,
        e.title as event_title, e.event_type, e.poster_url, e.banner_url, e.city as event_city,
        sh.show_date, sh.start_time, sh.end_time, sh.language, sh.format_name,
        v.name as venue_name, v.address as venue_address, v.city as venue_city,
        sc.name as screen_name, sc.screen_type,
        u.name as user_name, u.email as user_email, u.phone as user_phone,
        p.payment_id, p.transaction_id, p.payment_method, p.payment_status, p.paid_at
      FROM bookings b
      JOIN shows sh ON b.show_id = sh.show_id
      JOIN events e ON sh.event_id = e.event_id
      JOIN venues v ON sh.venue_id = v.venue_id
      LEFT JOIN screens sc ON sh.screen_id = sc.screen_id
      JOIN users u ON b.user_id = u.user_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
    `;

    const params: any[] = [];
    if (userIdParam) {
      query += ` WHERE b.user_id = ? `;
      params.push(parseInt(userIdParam, 10));
    }
    query += ` ORDER BY b.created_at DESC`;

    const bookings = db.prepare(query).all(...params) as any[];

    // Fetch seats for each booking
    const seatQuery = db.prepare(`
      SELECT bs.*, s.seat_number, s.row_label, s.seat_category
      FROM booking_seats bs
      JOIN seats s ON bs.seat_id = s.seat_id
      WHERE bs.booking_id = ?
    `);

    const result = bookings.map(b => {
      const seats = seatQuery.all(b.booking_id);
      return {
        ...b,
        seats,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      user_id = 2,
      show_id,
      seat_ids, // array of seat_id
      payment_method = 'UPI',
      convenience_fee = 45,
      discount = 0,
      customer_name,
      customer_email,
      customer_phone,
    } = body;

    if (!show_id || !Array.isArray(seat_ids) || seat_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide show_id and at least one seat_id' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check show details
    const show = db.prepare(`
      SELECT sh.*, e.title as event_title, e.city as event_city
      FROM shows sh
      JOIN events e ON sh.event_id = e.event_id
      WHERE sh.show_id = ?
    `).get(show_id) as any;

    if (!show) {
      return NextResponse.json({ success: false, error: 'Show not found' }, { status: 404 });
    }

    // Check seat availability
    const placeholders = seat_ids.map(() => '?').join(',');
    const seats = db.prepare(`
      SELECT s.*, ss.status as show_seat_status, ss.show_seat_id
      FROM seats s
      LEFT JOIN show_seats ss ON s.seat_id = ss.seat_id AND ss.show_id = ?
      WHERE s.seat_id IN (${placeholders})
    `).all(show_id, ...seat_ids) as any[];

    if (seats.length !== seat_ids.length) {
      return NextResponse.json({ success: false, error: 'One or more invalid seats selected' }, { status: 400 });
    }

    // Verify none are BOOKED
    const alreadyBooked = seats.filter(s => s.show_seat_status === 'BOOKED');
    if (alreadyBooked.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Seat(s) ${alreadyBooked.map(s => s.seat_number).join(', ')} are already booked. Please choose other seats.`,
        },
        { status: 409 }
      );
    }

    // Calculate subtotal
    let subtotal = 0;
    const seatPrices = seats.map(s => {
      const price = Math.round(show.ticket_price * s.price_multiplier);
      subtotal += price;
      return {
        seat_id: s.seat_id,
        seat_number: s.seat_number,
        seat_category: s.seat_category,
        price,
      };
    });

    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
    const totalAmount = Math.max(0, subtotal + convenience_fee + tax - discount);

    // Generate reference
    const cityCode = (show.event_city || 'DEL').substring(0, 3).toUpperCase();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const bookingReference = `TB-${cityCode}-2026-${randomCode}`;
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Begin transaction
    db.exec('BEGIN IMMEDIATE;');

    try {
      // 1. Insert booking
      const bookingInsert = db.prepare(`
        INSERT INTO bookings (
          booking_reference, user_id, show_id, subtotal, convenience_fee, tax, discount, total_amount,
          booking_status, qr_code, qr_data, confirmed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, CURRENT_TIMESTAMP)
      `).run(
        bookingReference,
        user_id,
        show_id,
        subtotal,
        convenience_fee,
        tax,
        discount,
        totalAmount,
        `QR-${bookingReference}`,
        bookingReference
      );

      const bookingId = Number(bookingInsert.lastInsertRowid);

      // 2. Insert booking_seats
      const insertBookingSeat = db.prepare(`
        INSERT INTO booking_seats (booking_id, show_id, seat_id, seat_number, seat_category, price)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const sp of seatPrices) {
        insertBookingSeat.run(bookingId, show_id, sp.seat_id, sp.seat_number, sp.seat_category, sp.price);
      }

      // 3. Update or Insert show_seats
      const updateShowSeat = db.prepare(`
        INSERT INTO show_seats (show_id, seat_id, status, booking_id, updated_at)
        VALUES (?, ?, 'BOOKED', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(show_id, seat_id) DO UPDATE SET
          status = 'BOOKED',
          booking_id = excluded.booking_id,
          updated_at = CURRENT_TIMESTAMP
      `);

      for (const sp of seatPrices) {
        updateShowSeat.run(show_id, sp.seat_id, bookingId);
      }

      // 4. Insert payment
      db.prepare(`
        INSERT INTO payments (booking_id, transaction_id, payment_method, amount, payment_status, paid_at)
        VALUES (?, ?, ?, ?, 'SUCCESS', CURRENT_TIMESTAMP)
      `).run(bookingId, transactionId, payment_method, totalAmount);

      // 5. Log confirmation email
      const user = db.prepare('SELECT email FROM users WHERE user_id = ?').get(user_id) as any;
      const recipientEmail = customer_email || user?.email || 'customer@example.com';
      db.prepare(`
        INSERT INTO email_logs (user_id, booking_id, email_type, recipient, subject, status, sent_at)
        VALUES (?, ?, 'BOOKING_CONFIRMATION', ?, ?, 'SENT', CURRENT_TIMESTAMP)
      `).run(user_id, bookingId, recipientEmail, `Booking Confirmed - ${bookingReference}`);

      db.exec('COMMIT;');

      return NextResponse.json({
        success: true,
        data: {
          booking_id: bookingId,
          booking_reference: bookingReference,
          transaction_id: transactionId,
          total_amount: totalAmount,
          seats: seatPrices,
          booking_status: 'CONFIRMED',
        },
      });
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
