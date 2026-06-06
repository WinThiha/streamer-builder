import type { Context, Next } from 'hono';
import { env } from '../env.js';
import { isSetupComplete } from '../deployment-settings/repository.js';
import { readSessionCookie, verifySessionToken } from './session.js';

export function isAdminAuthDisabled(): boolean {
  return env.NODE_ENV === 'development' && env.ADMIN_AUTH_DISABLED;
}

export async function requireAdminAuth(c: Context, next: Next): Promise<Response | void> {
  if (isAdminAuthDisabled()) {
    await next();
    return;
  }

  const setupComplete = await isSetupComplete();
  if (!setupComplete) {
    await next();
    return;
  }

  const token = readSessionCookie(c.req.header('cookie'));
  if (!verifySessionToken(token)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
}
