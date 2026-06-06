import { z } from 'zod';
import {
  connectorConfigSchema,
  connectorKindSchema,
  embedConnectorConfigSchema,
  httpConnectorConfigSchema,
  manualConnectorConfigSchema,
} from './connector.js';

export const setupStepsSchema = z.object({
  adminPassword: z.boolean(),
  tmdbKey: z.boolean(),
});

export type SetupSteps = z.infer<typeof setupStepsSchema>;

export const setupStatusSchema = z.object({
  complete: z.boolean(),
  steps: setupStepsSchema,
});

export type SetupStatus = z.infer<typeof setupStatusSchema>;

export const setupConnectorSchema = z.object({
  label: z.string().min(1),
  kind: connectorKindSchema,
  priority: z.number().int().default(100),
  config: z.unknown(),
});

export type SetupConnectorInput = z.infer<typeof setupConnectorSchema>;

export const setupCompleteBodySchema = z.object({
  adminPassword: z.string().min(8),
  tmdbApiKey: z.string().min(1),
  connector: setupConnectorSchema.optional(),
});

export type SetupCompleteBody = z.infer<typeof setupCompleteBodySchema>;

export function validateSetupConnectorConfig(
  kind: z.infer<typeof connectorKindSchema>,
  config: unknown,
): z.infer<typeof connectorConfigSchema> {
  if (kind === 'http') {
    return httpConnectorConfigSchema.parse({ ...(config as object), kind: 'http' });
  }
  if (kind === 'manual') {
    return manualConnectorConfigSchema.parse({ ...(config as object), kind: 'manual' });
  }
  if (kind === 'embed') {
    return embedConnectorConfigSchema.parse({ ...(config as object), kind: 'embed' });
  }
  return connectorConfigSchema.parse({ ...(config as object), kind });
}
