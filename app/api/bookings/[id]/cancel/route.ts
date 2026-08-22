import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id, 10);
    const db = getDb();

    const booking = db.prepare('SELECT * FROM bookings WHERE booking_id = ?').get(bookingId) as any;
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (booking.booking_status === 'CANCELLED') {
      return NextResponse.json({ success: false, error: 'Booking is already cancelled' }, { status: 400 });
    }

    db.exec('BEGIN IMMEDIATE;');

    try {
      // 1. Update booking status
      db.prepare(`
        UPDATE bookings 
        SET booking_status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP
        WHERE booking_id = ?
      `).run(bookingId);

      // 2. Free up show seats
      db.prepare(`
        UPDATE show_seats 
        SET status = 'AVAILABLE', booking_id = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE booking_id = ?
      `).run(bookingId);

      // 3. Mark payment as REFUNDED
      db.prepare(`
        UPDATE payments 
        SET payment_status = 'REFUNDED'
        WHERE booking_id = ?
      `).run(bookingId);

      // 4. Log cancellation email
      const user = db.prepare('SELECT email FROM users WHERE user_id = ?').get(booking.user_id) as any;
      db.prepare(`
        INSERT INTO email_logs (user_id, booking_id, email_type, recipient, subject, status, sent_at)
        VALUES (?, ?, 'CANCELLATION', ?, ?, 'SENT', CURRENT_TIMESTAMP)
      `).run(booking.user_id, bookingId, user?.email || 'customer@example.com', `Booking Cancelled - ${booking.booking_reference}`);

      db.exec('COMMIT;');

      return NextResponse.json({
        success: true,
        message: 'Booking cancelled successfully and seats released',
      });
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
