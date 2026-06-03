import { Hono } from 'hono';
import { resolveRequestSchema, sourceSchema } from '@movie-streamer/shared';
import { env } from '../env.js';
import { resolvePlay } from '../resolve/orchestrator.js';

export const playRoutes = new Hono();

playRoutes.get('/demo', (c) => {
  const source = sourceSchema.parse({
    id: 'demo-hls',
    connectorId: 'demo',
    label: 'Demo Stream',
    kind: 'hls',
    url: env.DEMO_HLS_URL,
  });
  return c.json(source);
});

playRoutes.post('/resolve', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = resolveRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid resolve request', details: parsed.error.flatten() }, 400);
  }

  const response = await resolvePlay(parsed.data);
  return c.json(response);
});
