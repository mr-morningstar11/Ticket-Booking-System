import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'ticket_booking.db');
let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(dbPath);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}
