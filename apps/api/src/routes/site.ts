import { Hono } from 'hono';
import { readFileSync } from 'node:fs';
import { getPublishedSiteConfig } from '../site-config/repository.js';
import { getLogoContentType, readLogoFile, resolveAssetPath, SITE_LOGO_ASSET_ID } from '../site-config/assets.js';

export const siteRoutes = new Hono();

siteRoutes.get('/config', async (c) => {
  const config = await getPublishedSiteConfig();
  if (!config) {
    return c.json({ error: 'Site config not initialized' }, 503);
  }
  return c.json(config);
});

siteRoutes.get('/assets/:assetId', async (c) => {
  const assetId = c.req.param('assetId');
  if (assetId.includes('..') || assetId.includes('/') || assetId !== SITE_LOGO_ASSET_ID) {
    return c.json({ error: 'Not found' }, 404);
  }

  const filePath = resolveAssetPath(assetId);
  if (filePath) {
    const buffer = readFileSync(filePath);
    return new Response(buffer, {
      headers: { 'Content-Type': getLogoContentType(filePath) },
    });
  }

  const legacy = readLogoFile();
  if (legacy) {
    return new Response(legacy.buffer, {
      headers: { 'Content-Type': legacy.contentType },
    });
  }

  return c.json({ error: 'Not found' }, 404);
});
