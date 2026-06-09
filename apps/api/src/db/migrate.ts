import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { env } from '../env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function ensureMigrationsTable(pool: pg.Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(pool: pg.Pool): Promise<Set<string>> {
  const result = await pool.query<{ filename: string }>(
    'SELECT filename FROM schema_migrations ORDER BY filename',
  );
  return new Set(result.rows.map((row) => row.filename));
}

export async function runMigrations(): Promise<void> {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
  try {
    await ensureMigrationsTable(pool);
    const applied = await getAppliedMigrations(pool);

    const sqlDir = join(__dirname, '../../drizzle');
    const files = readdirSync(sqlDir)
      .filter((name) => name.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = readFileSync(join(sqlDir, file), 'utf8');
      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await pool.query('COMMIT');
        console.log(`Applied migration: ${file}`);
      } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
      }
    }
  } finally {
    await pool.end();
  }
}
