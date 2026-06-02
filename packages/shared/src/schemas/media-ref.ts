import { z } from 'zod';

export const mediaRefTypeSchema = z.enum(['movie', 'tv', 'episode']);

export const mediaRefSchema = z.object({
  provider: z.string().min(1),
  type: mediaRefTypeSchema,
  id: z.string().min(1),
  season: z.number().int().positive().optional(),
  episode: z.number().int().positive().optional(),
});

export type MediaRef = z.infer<typeof mediaRefSchema>;
