import { Hono } from 'hono';
import { z } from 'zod';
import { siteConfigPatchSchema } from '@movie-streamer/shared';
import {
  getAdminSiteConfig,
  getDraftSiteConfig,
  patchDraftSiteConfig,
  publishDraftSiteConfig,
  resetSiteConfigToDefault,
  setDraftLogo,
} from '../../site-config/repository.js';
import {
  ensureUploadDir,
  saveLogoFile,
  SITE_LOGO_ASSET_ID,
  SITE_LOGO_PUBLIC_PATH,
  validateLogoMime,
} from '../../site-config/assets.js';
import { env } from '../../env.js';
import { TmdbClient, TmdbError } from '../../tmdb/client.js';
import { buildCatalogHome } from '../../catalog/home-builder.js';

export const adminSiteRoutes = new Hono();

const tmdb = new TmdbClient(env.TMDB_API_KEY);

adminSiteRoutes.get('/config', async (c) => {
  const data = await getAdminSiteConfig();
  if (!data) {
    return c.json({ error: 'Site config not initialized' }, 503);
  }
  return c.json(data);
});

adminSiteRoutes.patch('/config/draft', async (c) => {
  try {
    const body = siteConfigPatchSchema.parse(await c.req.json());
    const data = await patchDraftSiteConfig(body);
    return c.json(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Invalid site config', details: err.flatten() }, 400);
    }
    throw err;
  }
});

adminSiteRoutes.post('/config/publish', async (c) => {
  const data = await publishDraftSiteConfig();
  return c.json(data);
});

adminSiteRoutes.post('/config/reset-default', async (c) => {
  const data = await resetSiteConfigToDefault();
  return c.json(data);
});

adminSiteRoutes.post('/logo', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];
  if (!file || typeof file === 'string') {
    return c.json({ error: 'Expected multipart file field "file"' }, 400);
  }

  const mime = file.type;
  const ext = validateLogoMime(mime);
  if (!ext) {
    return c.json({ error: 'Unsupported image type. Use PNG, JPEG, or WebP.' }, 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > env.MAX_LOGO_BYTES) {
    return c.json({ error: `Logo exceeds maximum size of ${env.MAX_LOGO_BYTES} bytes` }, 400);
  }

  ensureUploadDir();
  saveLogoFile(buffer, ext);

  const data = await setDraftLogo({
    kind: 'uploaded',
    assetId: SITE_LOGO_ASSET_ID,
    url: SITE_LOGO_PUBLIC_PATH,
  });

  return c.json(data);
});

adminSiteRoutes.get('/preview-home', async (c) => {
  const draft = await getDraftSiteConfig();
  if (!draft) {
    return c.json({ error: 'Site config not initialized' }, 503);
  }

  try {
    const home = await buildCatalogHome(tmdb, draft.homepage.blocks, {
      showHero: draft.homepage.showHero,
    });
    return c.json(home);
  } catch (err) {
    if (err instanceof TmdbError) {
      const status = err.status >= 500 ? 503 : 502;
      return c.json({ error: 'Catalog service unavailable' }, status);
    }
    throw err;
  }
});
