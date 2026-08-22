import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const events = db.prepare(`
      SELECT 
        e.*,
        md.genre, md.director, md.cast_members, md.original_language, md.trailer_url, md.rating, md.total_reviews,
        cd.artist, cd.genre as concert_genre
      FROM events e
      LEFT JOIN movie_details md ON e.event_id = md.event_id
      LEFT JOIN concert_details cd ON e.event_id = cd.event_id
      ORDER BY e.start_date ASC
    `).all();

    const languages = db.prepare('SELECT * FROM movie_languages').all();
    const formats = db.prepare('SELECT * FROM movie_formats').all();

    const enriched = events.map((ev: any) => {
      return {
        ...ev,
        languages: languages.filter((l: any) => l.event_id === ev.event_id).map((l: any) => l.language),
        formats: formats.filter((f: any) => f.event_id === ev.event_id),
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
