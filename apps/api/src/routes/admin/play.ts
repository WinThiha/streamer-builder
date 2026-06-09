import { Hono } from 'hono';
import { adminResolveRequestSchema } from '@movie-streamer/shared';
import { resolvePlayWithDiagnostics } from '../../resolve/orchestrator.js';
import { requireAdminAuth } from '../../auth/middleware.js';

export const adminPlayRoutes = new Hono();

adminPlayRoutes.use('*', requireAdminAuth);

adminPlayRoutes.post('/resolve', async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = adminResolveRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: 'Invalid resolve request', details: parsed.error.flatten() }, 400);
  }

  const result = await resolvePlayWithDiagnostics(parsed.data);
  return c.json(result);
});
