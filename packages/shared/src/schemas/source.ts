import { z } from 'zod';

export const sourceKindSchema = z.enum(['hls', 'progressive', 'embed']);

export const subtitleSchema = z.object({
  url: z.string().url(),
  lang: z.string().min(1),
  label: z.string().optional(),
});

export const sourceSchema = z.object({
  id: z.string().min(1),
  connectorId: z.string().min(1),
  label: z.string().min(1),
  kind: sourceKindSchema,
  url: z.string().url(),
  expiresAt: z.string().datetime().optional(),
  subtitles: z.array(subtitleSchema).optional(),
});

export type Source = z.infer<typeof sourceSchema>;
export type SourceKind = z.infer<typeof sourceKindSchema>;
export type Subtitle = z.infer<typeof subtitleSchema>;
