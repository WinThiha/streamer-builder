import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from './env.js';

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool);

export async function checkDatabase(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
