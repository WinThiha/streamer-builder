import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { env } from '../env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runMigrations(): Promise<void> {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
  try {
    const sqlPath = join(__dirname, '../../drizzle/0000_connectors.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
  } finally {
    await pool.end();
  }
}
