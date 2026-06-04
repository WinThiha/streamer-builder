import { siteConfigSchema, type SiteConfig, type SiteConfigPatch } from '@movie-streamer/shared';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMergeRecords(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const existing = result[key];
    if (isPlainObject(existing) && isPlainObject(value)) {
      result[key] = deepMergeRecords(existing, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function mergeSiteConfig(base: SiteConfig, patch: SiteConfigPatch): SiteConfig {
  return siteConfigSchema.parse(
    deepMergeRecords(base as Record<string, unknown>, patch as Record<string, unknown>),
  );
}
