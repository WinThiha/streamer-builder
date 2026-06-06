import { ensureDeploymentSettingsRow } from './repository.js';

export async function seedDeploymentSettings(): Promise<void> {
  await ensureDeploymentSettingsRow();
}
