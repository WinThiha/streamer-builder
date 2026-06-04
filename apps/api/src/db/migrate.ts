import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { env } from '../env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runMigrations(): Promise<void> {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
  try {
    const sqlDir = join(__dirname, '../../drizzle');
    const files = readdirSync(sqlDir)
      .filter((name) => name.endsWith('.sql'))
      .sort();
    for (const file of files) {
      const sql = readFileSync(join(sqlDir, file), 'utf8');
      await pool.query(sql);
    }
  } finally {
    await pool.end();
  }
}
