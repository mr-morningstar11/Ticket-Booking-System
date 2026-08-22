import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const showId = parseInt(id, 10);
    const db = getDb();

    // Check show details
    const show = db.prepare(`
      SELECT 
        sh.*,
        e.title as event_title, e.event_type, e.poster_url, e.banner_url, e.duration_minutes, e.age_rating,
        v.name as venue_name, v.address as venue_address, v.city as venue_city,
        sc.name as screen_name, sc.screen_type
      FROM shows sh
      JOIN events e ON sh.event_id = e.event_id
      JOIN venues v ON sh.venue_id = v.venue_id
      LEFT JOIN screens sc ON sh.screen_id = sc.screen_id
      WHERE sh.show_id = ?
    `).get(showId) as any;

    if (!show) {
      return NextResponse.json({ success: false, error: 'Show not found' }, { status: 404 });
    }

    // Fetch seats and their show status
    const seats = db.prepare(`
      SELECT 
        s.seat_id,
        s.seat_number,
        s.row_label,
        s.seat_category,
        s.price_multiplier,
        ROUND(? * s.price_multiplier) as calculated_price,
        COALESCE(ss.status, 'AVAILABLE') as status,
        ss.show_seat_id,
        ss.hold_expires_at
      FROM seats s
      LEFT JOIN show_seats ss ON s.seat_id = ss.seat_id AND ss.show_id = ?
      WHERE s.screen_id = ?
      ORDER BY s.row_label ASC, CAST(SUBSTR(s.seat_number, 2) AS INTEGER) ASC, s.seat_number ASC
    `).all(show.ticket_price, showId, show.screen_id);

    return NextResponse.json({
      success: true,
      data: {
        show,
        seats,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
