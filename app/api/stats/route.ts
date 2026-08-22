import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get() as any;
    const totalBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'CONFIRMED'").get() as any;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE booking_status = 'CONFIRMED'").get() as any;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const totalShows = db.prepare('SELECT COUNT(*) as count FROM shows').get() as any;
    const seatsOccupied = db.prepare("SELECT COUNT(*) as count FROM show_seats WHERE status = 'BOOKED'").get() as any;
    const seatsAvailable = db.prepare("SELECT COUNT(*) as count FROM show_seats WHERE status = 'AVAILABLE'").get() as any;

    const recentBookings = db.prepare(`
      SELECT b.booking_id, b.booking_reference, b.total_amount, b.booking_status, b.created_at,
             u.name as user_name, e.title as event_title, sh.show_date, sh.start_time
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN shows sh ON b.show_id = sh.show_id
      JOIN events e ON sh.event_id = e.event_id
      ORDER BY b.created_at DESC
      LIMIT 10
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        totalEvents: totalEvents.count,
        totalBookings: totalBookings.count,
        totalRevenue: totalRevenue.total,
        totalUsers: totalUsers.count,
        totalShows: totalShows.count,
        seatsOccupied: seatsOccupied.count,
        seatsAvailable: seatsAvailable.count,
        recentBookings,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
