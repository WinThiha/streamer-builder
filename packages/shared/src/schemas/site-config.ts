import { z } from 'zod';

const hexColorSchema = z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);

export const homepageCategoryKeySchema = z.enum([
  'trending_day',
  'popular_movies',
  'popular_tv',
  'top_rated_movies',
]);

export type HomepageCategoryKey = z.infer<typeof homepageCategoryKeySchema>;

export const HOMEPAGE_CATEGORY_KEYS = homepageCategoryKeySchema.options;

export const HOMEPAGE_CATEGORY_LABELS: Record<HomepageCategoryKey, string> = {
  trending_day: 'Trending Today',
  popular_movies: 'Popular Movies',
  popular_tv: 'Popular TV',
  top_rated_movies: 'Top Rated Movies',
};

export const homepageBlockSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).optional(),
  categoryKey: homepageCategoryKeySchema,
});

export type HomepageBlock = z.infer<typeof homepageBlockSchema>;

export const logoSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('url'),
    url: z.string().url(),
  }),
  z.object({
    kind: z.literal('uploaded'),
    assetId: z.string().min(1),
    url: z.string().min(1),
  }),
]);

export type LogoConfig = z.infer<typeof logoSchema>;

export const siteThemeSchema = z.object({
  background: hexColorSchema,
  foreground: hexColorSchema,
  primary: hexColorSchema,
  muted: hexColorSchema,
  surface: hexColorSchema,
  fontSans: z.string().min(1).optional(),
});

export type SiteTheme = z.infer<typeof siteThemeSchema>;

export const templateIdSchema = z.enum(['hero-rows', 'grid-first']);

export type TemplateId = z.infer<typeof templateIdSchema>;

export const siteConfigSchema = z.object({
  identity: z.object({
    siteName: z.string().min(1),
    logo: logoSchema.optional(),
  }),
  theme: siteThemeSchema,
  templateId: templateIdSchema,
  homepage: z.object({
    showHero: z.boolean().default(true),
    blocks: z.array(homepageBlockSchema).min(1),
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

export const siteConfigPatchSchema = siteConfigSchema.deepPartial();

export type SiteConfigPatch = z.infer<typeof siteConfigPatchSchema>;

export const defaultSiteConfig: SiteConfig = {
  identity: {
    siteName: 'Movie Streamer',
  },
  theme: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    primary: '#e50914',
    muted: '#737373',
    surface: '#171717',
    fontSans: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  templateId: 'hero-rows',
  homepage: {
    showHero: true,
    blocks: [
      { id: 'trending', categoryKey: 'trending_day' },
      { id: 'popular-movies', categoryKey: 'popular_movies' },
      { id: 'popular-tv', categoryKey: 'popular_tv' },
    ],
  },
};
