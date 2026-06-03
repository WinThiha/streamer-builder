import { z } from 'zod';
import { sourceSchema } from './source.js';

export const connectorKindSchema = z.enum(['demo', 'manual', 'http']);

export const demoConnectorConfigSchema = z.object({
  kind: z.literal('demo'),
  sourceLabel: z.string().min(1).optional(),
});

export const manualConnectorConfigSchema = z.object({
  kind: z.literal('manual'),
  sources: z.array(sourceSchema.omit({ connectorId: true })).min(1),
});

export const httpConnectorConfigSchema = z.object({
  kind: z.literal('http'),
  resolveUrl: z.string().url(),
  timeoutMs: z.number().int().positive().max(60_000).optional(),
});

export const connectorConfigSchema = z.discriminatedUnion('kind', [
  demoConnectorConfigSchema,
  manualConnectorConfigSchema,
  httpConnectorConfigSchema,
]);

export type ConnectorKind = z.infer<typeof connectorKindSchema>;
export type DemoConnectorConfig = z.infer<typeof demoConnectorConfigSchema>;
export type ManualConnectorConfig = z.infer<typeof manualConnectorConfigSchema>;
export type HttpConnectorConfig = z.infer<typeof httpConnectorConfigSchema>;
export type ConnectorConfig = z.infer<typeof connectorConfigSchema>;
