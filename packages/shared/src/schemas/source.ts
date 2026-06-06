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
  /** Embed iframe: when true, apply sandboxPolicy (or platform default). */
  embedIframeSandboxEnabled: z.boolean().optional(),
  /** Embed iframe sandbox token list (space-separated). */
  embedIframeSandboxPolicy: z.string().min(1).optional(),
  /** Embed iframe Permissions-Policy allow list (semicolon-separated). */
  embedIframeAllow: z.string().min(1).optional(),
});

export type Source = z.infer<typeof sourceSchema>;
export type SourceKind = z.infer<typeof sourceKindSchema>;
export type Subtitle = z.infer<typeof subtitleSchema>;
