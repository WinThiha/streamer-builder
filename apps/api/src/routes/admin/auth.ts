import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { verifyPassword } from '../../auth/password.js';
import {
  clearSessionCookieOptions,
  getSessionCookieOptions,
  readSessionCookie,
  verifySessionToken,
} from '../../auth/session.js';
import { isAdminAuthDisabled } from '../../auth/middleware.js';
import { cookieSecureFlag } from '../../env.js';
import { getDeploymentSettings, isSetupComplete } from '../../deployment-settings/repository.js';

export const adminAuthRoutes = new Hono();

adminAuthRoutes.post('/login', async (c) => {
  if (!(await isSetupComplete())) {
    return c.json({ error: 'Setup not completed' }, 403);
  }

  let body: { password?: string };
  try {
    body = (await c.req.json()) as { password?: string };
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.password) {
    return c.json({ error: 'Password required' }, 400);
  }

  const settings = await getDeploymentSettings();
  if (!settings?.adminPasswordHash || !verifyPassword(body.password, settings.adminPasswordHash)) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const cookie = getSessionCookieOptions(cookieSecureFlag());
  setCookie(c, cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });

  return c.json({ ok: true });
});

adminAuthRoutes.post('/logout', async (c) => {
  const cookie = clearSessionCookieOptions(cookieSecureFlag());
  setCookie(c, cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });
  return c.json({ ok: true });
});

adminAuthRoutes.get('/session', async (c) => {
  const complete = await isSetupComplete();
  if (isAdminAuthDisabled()) {
    return c.json({ setupComplete: complete, authenticated: true, authRequired: false });
  }

  const token = readSessionCookie(c.req.header('cookie'));
  const authenticated = verifySessionToken(token);
  return c.json({
    setupComplete: complete,
    authenticated,
    authRequired: complete,
  });
});
