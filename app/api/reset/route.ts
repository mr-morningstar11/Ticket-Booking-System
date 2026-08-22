import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import fs from 'node:fs';
import path from 'node:path';

export async function POST() {
  try {
    const db = getDb();
    const sqlPath = path.join(process.cwd(), 'database.sql');
    if (!fs.existsSync(sqlPath)) {
      return NextResponse.json({ success: false, error: 'database.sql not found' }, { status: 404 });
    }
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    db.exec(sqlContent);

    return NextResponse.json({ success: true, message: 'Database successfully reseeded from database.sql' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
