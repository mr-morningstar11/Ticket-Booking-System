import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const eventId = parseInt(id, 10);
    const db = getDb();

    const event = db.prepare(`
      SELECT 
        e.*,
        md.genre, md.director, md.cast_members, md.original_language, md.trailer_url, md.rating, md.total_reviews,
        cd.artist, cd.genre as concert_genre
      FROM events e
      LEFT JOIN movie_details md ON e.event_id = md.event_id
      LEFT JOIN concert_details cd ON e.event_id = cd.event_id
      WHERE e.event_id = ?
    `).get(eventId) as any;

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    const languages = (db.prepare('SELECT language FROM movie_languages WHERE event_id = ?').all(eventId) as any[]).map(l => l.language);
    const formats = db.prepare('SELECT * FROM movie_formats WHERE event_id = ?').all(eventId);
    const shows = db.prepare(`
      SELECT 
        sh.*,
        v.name as venue_name, v.address as venue_address, v.city as venue_city, v.region as venue_region,
        sc.name as screen_name, sc.screen_type, sc.total_seats,
        (SELECT COUNT(*) FROM show_seats ss WHERE ss.show_id = sh.show_id AND ss.status = 'AVAILABLE') as available_seats_count
      FROM shows sh
      JOIN venues v ON sh.venue_id = v.venue_id
      LEFT JOIN screens sc ON sh.screen_id = sc.screen_id
      WHERE sh.event_id = ?
      ORDER BY sh.show_date ASC, sh.start_time ASC
    `).all(eventId);

    return NextResponse.json({
      success: true,
      data: {
        ...event,
        languages,
        formats,
        shows,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
