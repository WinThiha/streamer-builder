import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { resolveResponseSchema } from '@movie-streamer/shared';
import { checkDatabase, closeDatabase } from './db.js';
import { env } from './env.js';
import { runMigrations } from './db/migrate.js';
import { seedConnectors } from './connectors/seed.js';
import { seedSiteConfig } from './site-config/seed.js';
import { ensureUploadDirOnBoot } from './site-config/assets.js';
import { catalogRoutes } from './routes/catalog.js';
import { playRoutes } from './routes/play.js';
import { adminConnectorRoutes } from './routes/admin/connectors.js';
import { siteRoutes } from './routes/site.js';
import { adminSiteRoutes } from './routes/admin/site-config.js';

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
app.route('/v1/site', siteRoutes);
app.route('/v1/admin/connectors', adminConnectorRoutes);
app.route('/v1/admin/site', adminSiteRoutes);

const port = env.PORT;

async function bootstrap() {
  ensureUploadDirOnBoot();
  await runMigrations();
  await seedSiteConfig();
  await seedConnectors();
  console.log(`API listening on http://localhost:${port} (APP_MODE=${env.APP_MODE})`);
  serve({ fetch: app.fetch, port });
}

void bootstrap();

process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});
