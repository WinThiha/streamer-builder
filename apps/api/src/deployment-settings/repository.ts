import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { deploymentSettings } from '../db/schema.js';

export const DEPLOYMENT_SETTINGS_ID = 'default';

export type DeploymentSettingsRow = typeof deploymentSettings.$inferSelect;

export async function getDeploymentSettings(): Promise<DeploymentSettingsRow | null> {
  const rows = await db
    .select()
    .from(deploymentSettings)
    .where(eq(deploymentSettings.id, DEPLOYMENT_SETTINGS_ID))
    .limit(1);
  return rows[0] ?? null;
}

export async function ensureDeploymentSettingsRow(): Promise<DeploymentSettingsRow> {
  const existing = await getDeploymentSettings();
  if (existing) return existing;

  const rows = await db
    .insert(deploymentSettings)
    .values({ id: DEPLOYMENT_SETTINGS_ID })
    .returning();
  return rows[0]!;
}

export async function isSetupComplete(): Promise<boolean> {
  const row = await getDeploymentSettings();
  return row?.setupCompletedAt != null && row.adminPasswordHash != null;
}

export async function getEffectiveTmdbApiKey(envFallback?: string): Promise<string | null> {
  const row = await getDeploymentSettings();
  if (row?.tmdbApiKey) return row.tmdbApiKey;
  if (envFallback) return envFallback;
  return null;
}

export async function updateDeploymentSettings(
  patch: Partial<Pick<DeploymentSettingsRow, 'adminPasswordHash' | 'tmdbApiKey' | 'setupCompletedAt'>>,
): Promise<DeploymentSettingsRow> {
  await ensureDeploymentSettingsRow();
  const rows = await db
    .update(deploymentSettings)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(deploymentSettings.id, DEPLOYMENT_SETTINGS_ID))
    .returning();
  return rows[0]!;
}

export async function markSetupComplete(
  adminPasswordHash: string,
  tmdbApiKey: string,
): Promise<DeploymentSettingsRow> {
  return updateDeploymentSettings({
    adminPasswordHash,
    tmdbApiKey,
    setupCompletedAt: new Date(),
  });
}
