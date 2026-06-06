import { z } from 'zod';
import { mediaRefSchema } from './media-ref.js';
import { sourceSchema } from './source.js';

export const resolveRequestSchema = z.object({
  mediaRef: mediaRefSchema,
  metadata: z.record(z.unknown()).optional(),
});

/** Full resolve response returned by the platform to subscribers. */
export const resolveResponseSchema = z.object({
  sources: z.array(sourceSchema),
});

/**
 * HTTP connector resolver response: sources omit connectorId (platform sets it).
 * Matches manual connector partial sources and connector contract v1.
 */
export const externalResolveResponseSchema = z.object({
  sources: z.array(sourceSchema.omit({ connectorId: true })),
});

export type ResolveRequest = z.infer<typeof resolveRequestSchema>;
export type ResolveResponse = z.infer<typeof resolveResponseSchema>;
export type ExternalResolveResponse = z.infer<typeof externalResolveResponseSchema>;
