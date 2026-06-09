import { hashPassword } from '../auth/password.js';
import { listConnectors, updateConnector } from '../connectors/repository.js';
import { env } from '../env.js';
import {
  getDeploymentSettings,
  markSetupComplete,
  updateDeploymentSettings,
} from '../deployment-settings/repository.js';
import { isPrototypeMode } from './mode.js';

const PROTOTYPE_INTERNAL_PASSWORD = 'prototype-internal-not-for-login';

export async function seedPrototypeMode(): Promise<void> {
  if (!isPrototypeMode()) return;

  const settings = await getDeploymentSettings();
  if (!settings?.setupCompletedAt) {
    const tmdbKey = env.TMDB_API_KEY;
    if (!tmdbKey) {
      console.warn(
        '[prototype] TMDB_API_KEY is required for vendor prototype catalog. Set it in environment.',
      );
    } else {
      await markSetupComplete(hashPassword(PROTOTYPE_INTERNAL_PASSWORD), tmdbKey);
    }
  } else if (env.TMDB_API_KEY && settings.tmdbApiKey !== env.TMDB_API_KEY) {
    await updateDeploymentSettings({ tmdbApiKey: env.TMDB_API_KEY });
  }

  const connectors = await listConnectors();
  for (const connector of connectors) {
    if (connector.kind !== 'demo') {
      await updateConnector(connector.id, { enabled: false });
    } else {
      await updateConnector(connector.id, { enabled: true });
    }
  }
}
