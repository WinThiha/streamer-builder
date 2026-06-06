import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { siteConfigSchema, type SiteConfig } from '@movie-streamer/shared';

export function loadSiteConfigFromYaml(filePath: string): SiteConfig | null {
  const absolute = resolve(filePath);
  if (!existsSync(absolute)) return null;

  const raw = readFileSync(absolute, 'utf8');
  const parsed = parseYaml(raw);
  return siteConfigSchema.parse(parsed);
}
