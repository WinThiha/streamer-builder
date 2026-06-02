import { Hono } from 'hono';
import { sourceSchema } from '@movie-streamer/shared';
import { env } from '../env.js';

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
