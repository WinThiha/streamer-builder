import { z } from 'zod';
import { resolveRequestSchema } from './resolve.js';
import { sourceSchema } from './source.js';

export const connectorResolveResultSchema = z.object({
  connectorId: z.string(),
  ok: z.boolean(),
  sourceCount: z.number().int().nonnegative(),
  error: z.string().optional(),
});

export const adminResolveResponseSchema = z.object({
  sources: z.array(sourceSchema),
  connectorResults: z.array(connectorResolveResultSchema),
});

export const adminResolveRequestSchema = resolveRequestSchema;

export type ConnectorResolveResult = z.infer<typeof connectorResolveResultSchema>;
export type AdminResolveResponse = z.infer<typeof adminResolveResponseSchema>;
