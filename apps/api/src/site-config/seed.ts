import { defaultSiteConfig } from '@movie-streamer/shared';
import { getSiteConfigRow, upsertSiteConfig } from './repository.js';

export async function seedSiteConfig(): Promise<void> {
  const existing = await getSiteConfigRow();
  if (existing) return;

  await upsertSiteConfig(defaultSiteConfig, defaultSiteConfig);
}
