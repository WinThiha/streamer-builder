import { z } from 'zod';
import { mediaRefSchema } from './media-ref.js';
import { sourceSchema } from './source.js';

export const resolveRequestSchema = z.object({
  mediaRef: mediaRefSchema,
});

export const resolveResponseSchema = z.object({
  sources: z.array(sourceSchema),
});

export type ResolveRequest = z.infer<typeof resolveRequestSchema>;
export type ResolveResponse = z.infer<typeof resolveResponseSchema>;
