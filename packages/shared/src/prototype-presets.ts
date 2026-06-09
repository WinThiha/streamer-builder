import { type SiteConfig, type SiteConfigPatch, defaultSiteConfig } from './schemas/site-config.js';

export type PrototypePreset = {
  slug: string;
  name: string;
  description: string;
  overlay: SiteConfigPatch;
};

export const PROTOTYPE_PRESETS: PrototypePreset[] = [
  {
    slug: 'fitness',
    name: 'Fitness Stream',
    description: 'Energetic red accent with hero-rows layout for sports and wellness catalogs.',
    overlay: {
      identity: { siteName: 'FitStream' },
      theme: {
        background: '#0d1117',
        foreground: '#f0f6fc',
        primary: '#ff4d4d',
        muted: '#8b949e',
        surface: '#161b22',
      },
      templateId: 'hero-rows',
    },
  },
  {
    slug: 'cinema',
    name: 'Cinema Classic',
    description: 'Deep black with gold accent and grid-first layout.',
    overlay: {
      identity: { siteName: 'Cinema Vault' },
      theme: {
        background: '#050505',
        foreground: '#f5f5f5',
        primary: '#d4af37',
        muted: '#9ca3af',
        surface: '#141414',
      },
      templateId: 'grid-first',
      homepage: { showHero: false },
    },
  },
  {
    slug: 'kids',
    name: 'Kids Zone',
    description: 'Bright playful palette with hero-rows layout.',
    overlay: {
      identity: { siteName: 'Kids Zone' },
      theme: {
        background: '#1a1033',
        foreground: '#ffffff',
        primary: '#7c3aed',
        muted: '#a78bfa',
        surface: '#2e1065',
      },
      templateId: 'hero-rows',
    },
  },
];

export function getPrototypePreset(slug: string): PrototypePreset | undefined {
  return PROTOTYPE_PRESETS.find((p) => p.slug === slug);
}

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Record<string, unknown>): T {
  const result = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && typeof result[key] === 'object') {
      result[key] = deepMerge(result[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as T;
}

export function applyPresetOverlay(preset: PrototypePreset): SiteConfig {
  return deepMerge(defaultSiteConfig, preset.overlay as Record<string, unknown>) as SiteConfig;
}
