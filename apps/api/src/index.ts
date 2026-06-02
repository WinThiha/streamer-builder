import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { resolveResponseSchema } from '@movie-streamer/shared';
import { checkDatabase, closeDatabase } from './db.js';
import { env } from './env.js';
import { catalogRoutes } from './routes/catalog.js';
import { playRoutes } from './routes/play.js';

const app = new Hono();

app.get('/health', async (c) => {
  const database = (await checkDatabase()) ? 'connected' : 'disconnected';
  const ok = database === 'connected';
  return c.json(
    {
      status: ok ? 'ok' : 'degraded',
      appMode: env.APP_MODE,
      database,
    },
    ok ? 200 : 503,
  );
});

/** Placeholder: validates shared resolve response shape is wired. */
app.get('/api/v1/contracts/resolve-sample', (c) => {
  const sample = resolveResponseSchema.parse({ sources: [] });
  return c.json(sample);
});

app.route('/v1/catalog', catalogRoutes);
app.route('/v1/play', playRoutes);

const port = env.PORT;

console.log(`API listening on http://localhost:${port} (APP_MODE=${env.APP_MODE})`);

serve({ fetch: app.fetch, port });

process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});
