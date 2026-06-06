import { env } from '../env.js';
import { getEffectiveTmdbApiKey } from '../deployment-settings/repository.js';
import { TmdbClient } from './client.js';
import { TmdbNotConfiguredError } from './not-configured.js';

export async function resolveTmdbApiKey(): Promise<string> {
  const key = await getEffectiveTmdbApiKey(env.TMDB_API_KEY);
  if (!key) {
    throw new TmdbNotConfiguredError();
  }
  return key;
}

export async function createTmdbClient(): Promise<TmdbClient> {
  const apiKey = await resolveTmdbApiKey();
  return new TmdbClient(apiKey);
}

export async function validateTmdbApiKey(apiKey: string): Promise<boolean> {
  const client = new TmdbClient(apiKey);
  try {
    await client.getConfiguration();
    return true;
  } catch {
    return false;
  }
}
