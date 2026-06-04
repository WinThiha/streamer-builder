import { eq } from 'drizzle-orm';
import {
  defaultSiteConfig,
  siteConfigSchema,
  type SiteConfig,
  type SiteConfigPatch,
} from '@movie-streamer/shared';
import { db } from '../db.js';
import { siteConfig, type SiteConfigRow } from '../db/schema.js';
import { mergeSiteConfig } from './merge.js';

const SITE_CONFIG_ID = 'site';

function parseConfig(data: unknown): SiteConfig {
  return siteConfigSchema.parse(data);
}

export type AdminSiteConfigResponse = {
  draft: SiteConfig;
  published: SiteConfig;
  updatedAt: string;
  publishedAt: string | null;
};

function toAdminResponse(row: SiteConfigRow): AdminSiteConfigResponse {
  return {
    draft: parseConfig(row.draft),
    published: parseConfig(row.published),
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

export async function getSiteConfigRow(): Promise<SiteConfigRow | null> {
  const rows = await db.select().from(siteConfig).where(eq(siteConfig.id, SITE_CONFIG_ID)).limit(1);
  return rows[0] ?? null;
}

export async function getPublishedSiteConfig(): Promise<SiteConfig | null> {
  const row = await getSiteConfigRow();
  return row ? parseConfig(row.published) : null;
}

export async function getDraftSiteConfig(): Promise<SiteConfig | null> {
  const row = await getSiteConfigRow();
  return row ? parseConfig(row.draft) : null;
}

export async function getAdminSiteConfig(): Promise<AdminSiteConfigResponse | null> {
  const row = await getSiteConfigRow();
  return row ? toAdminResponse(row) : null;
}

export async function upsertSiteConfig(draft: SiteConfig, published: SiteConfig): Promise<AdminSiteConfigResponse> {
  const validatedDraft = parseConfig(draft);
  const validatedPublished = parseConfig(published);
  const now = new Date();
  const existing = await getSiteConfigRow();

  if (existing) {
    const rows = await db
      .update(siteConfig)
      .set({
        draft: validatedDraft,
        published: validatedPublished,
        updatedAt: now,
        publishedAt: existing.publishedAt ?? now,
      })
      .where(eq(siteConfig.id, SITE_CONFIG_ID))
      .returning();
    return toAdminResponse(rows[0]!);
  }

  const rows = await db
    .insert(siteConfig)
    .values({
      id: SITE_CONFIG_ID,
      draft: validatedDraft,
      published: validatedPublished,
      updatedAt: now,
      publishedAt: now,
    })
    .returning();
  return toAdminResponse(rows[0]!);
}

export async function patchDraftSiteConfig(patch: SiteConfigPatch): Promise<AdminSiteConfigResponse> {
  const row = await getSiteConfigRow();
  if (!row) {
    throw new Error('Site config not seeded');
  }
  const currentDraft = parseConfig(row.draft);
  const nextDraft = mergeSiteConfig(currentDraft, patch);
  const now = new Date();
  const rows = await db
    .update(siteConfig)
    .set({
      draft: nextDraft,
      updatedAt: now,
    })
    .where(eq(siteConfig.id, SITE_CONFIG_ID))
    .returning();
  return toAdminResponse(rows[0]!);
}

export async function publishDraftSiteConfig(): Promise<AdminSiteConfigResponse> {
  const row = await getSiteConfigRow();
  if (!row) {
    throw new Error('Site config not seeded');
  }
  const draft = parseConfig(row.draft);
  const now = new Date();
  const rows = await db
    .update(siteConfig)
    .set({
      published: draft,
      publishedAt: now,
      updatedAt: now,
    })
    .where(eq(siteConfig.id, SITE_CONFIG_ID))
    .returning();
  return toAdminResponse(rows[0]!);
}

export async function resetSiteConfigToDefault(): Promise<AdminSiteConfigResponse> {
  const defaults = parseConfig(defaultSiteConfig);
  const now = new Date();
  const row = await getSiteConfigRow();
  if (!row) {
    return upsertSiteConfig(defaults, defaults);
  }
  const rows = await db
    .update(siteConfig)
    .set({
      draft: defaults,
      published: defaults,
      updatedAt: now,
      publishedAt: now,
    })
    .where(eq(siteConfig.id, SITE_CONFIG_ID))
    .returning();
  return toAdminResponse(rows[0]!);
}

export async function setDraftLogo(logo: NonNullable<SiteConfig['identity']['logo']>): Promise<AdminSiteConfigResponse> {
  const row = await getSiteConfigRow();
  if (!row) {
    throw new Error('Site config not seeded');
  }
  const draft = parseConfig(row.draft);
  return patchDraftSiteConfig({
    identity: {
      ...draft.identity,
      logo,
    },
  });
}
