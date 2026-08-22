import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('user_id');
    const db = getDb();

    let query = `
      SELECT 
        w.*,
        e.title as event_title, e.event_type, e.poster_url, e.city as event_city,
        sh.show_date, sh.start_time,
        v.name as venue_name
      FROM waitlist w
      JOIN events e ON w.event_id = e.event_id
      LEFT JOIN shows sh ON w.show_id = sh.show_id
      LEFT JOIN venues v ON sh.venue_id = v.venue_id
    `;
    const params: any[] = [];
    if (userIdParam) {
      query += ` WHERE w.user_id = ? `;
      params.push(parseInt(userIdParam, 10));
    }
    query += ` ORDER BY w.created_at DESC`;

    const waitlist = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, data: waitlist });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id = 2, event_id, show_id, seat_category = 'PREMIUM' } = body;

    if (!event_id) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    const db = getDb();
    // Get max position
    const posRes = db.prepare(`
      SELECT COALESCE(MAX(position), 0) + 1 as next_pos 
      FROM waitlist 
      WHERE event_id = ? AND seat_category = ?
    `).get(event_id, seat_category) as any;

    const nextPos = posRes?.next_pos || 1;

    const insert = db.prepare(`
      INSERT INTO waitlist (event_id, show_id, user_id, seat_category, position, status)
      VALUES (?, ?, ?, ?, ?, 'WAITING')
    `).run(event_id, show_id || null, user_id, seat_category, nextPos);

    return NextResponse.json({
      success: true,
      data: {
        waitlist_id: Number(insert.lastInsertRowid),
        position: nextPos,
        status: 'WAITING',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
