import { Hono } from 'hono';
import {
  setupCompleteBodySchema,
  setupStatusSchema,
  validateSetupConnectorConfig,
} from '@movie-streamer/shared';
import { hashPassword } from '../auth/password.js';
import { createConnector } from '../connectors/repository.js';
import {
  getDeploymentSettings,
  isSetupComplete,
  markSetupComplete,
} from '../deployment-settings/repository.js';
import { publishDraftSiteConfig, upsertSiteConfig } from '../site-config/repository.js';
import { loadSiteConfigFromYaml } from '../site-config/bootstrap-yaml.js';
import { defaultSiteConfig } from '@movie-streamer/shared';
import { env } from '../env.js';
import { validateTmdbApiKey } from '../tmdb/runtime.js';
import { isPrototypeMode } from '../prototype/mode.js';

export const setupRoutes = new Hono();

async function buildSetupStatus() {
  if (isPrototypeMode()) {
    return setupStatusSchema.parse({
      complete: true,
      steps: { adminPassword: false, tmdbKey: false },
    });
  }
  const row = await getDeploymentSettings();
  const complete = row?.setupCompletedAt != null && row.adminPasswordHash != null;
  return setupStatusSchema.parse({
    complete,
    steps: {
      adminPassword: !row?.adminPasswordHash,
      tmdbKey: !row?.tmdbApiKey,
    },
  });
}

setupRoutes.get('/status', async (c) => {
  return c.json(await buildSetupStatus());
});

setupRoutes.post('/complete', async (c) => {
  if (await isSetupComplete()) {
    return c.json({ error: 'Setup already completed' }, 409);
  }

  const body = setupCompleteBodySchema.parse(await c.req.json());

  const tmdbValid = await validateTmdbApiKey(body.tmdbApiKey);
  if (!tmdbValid) {
    return c.json({ error: 'Invalid TMDB API key' }, 400);
  }

  const bootstrapPath = env.SITE_CONFIG_BOOTSTRAP_PATH ?? './site.config.yaml';
  const imported = loadSiteConfigFromYaml(bootstrapPath);
  const siteConfig = imported ?? defaultSiteConfig;
  await upsertSiteConfig(siteConfig, siteConfig);
  await publishDraftSiteConfig();

  if (body.connector) {
    const config = validateSetupConnectorConfig(body.connector.kind, body.connector.config);
    await createConnector({
      id: crypto.randomUUID(),
      label: body.connector.label,
      kind: body.connector.kind,
      enabled: true,
      priority: body.connector.priority,
      config,
    });
  }

  const adminPasswordHash = hashPassword(body.adminPassword);
  await markSetupComplete(adminPasswordHash, body.tmdbApiKey);

  return c.json(await buildSetupStatus());
});
