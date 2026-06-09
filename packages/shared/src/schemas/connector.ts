import { z } from 'zod';
import {
  assertValidEmbedUrlAfterInterpolation,
  SAMPLE_MOVIE_MEDIA_REF,
  SAMPLE_TV_EPISODE_MEDIA_REF,
} from '../embed-template.js';
import { sourceSchema } from './source.js';

export const connectorKindSchema = z.enum(['demo', 'manual', 'http', 'embed', 'manifest']);

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

function movieUrlTemplateSchema() {
  return z
    .string()
    .min(1)
    .refine((template) => template.includes('{id}'), {
      message: 'movieUrlTemplate must contain {id}',
    })
    .refine(
      (template) => {
        try {
          assertValidEmbedUrlAfterInterpolation(template, SAMPLE_MOVIE_MEDIA_REF);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'movieUrlTemplate must produce a valid URL after interpolation' },
    );
}

function tvUrlTemplateSchema() {
  return z
    .string()
    .min(1)
    .refine((template) => template.includes('{id}'), {
      message: 'tvUrlTemplate must contain {id}',
    })
    .refine((template) => template.includes('{season}') && template.includes('{episode}'), {
      message: 'tvUrlTemplate must contain {season} and {episode}',
    })
    .refine(
      (template) => {
        try {
          assertValidEmbedUrlAfterInterpolation(template, SAMPLE_TV_EPISODE_MEDIA_REF);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'tvUrlTemplate must produce a valid URL after interpolation' },
    );
}

const embedConnectorInputSchema = z.object({
  kind: z.literal('embed'),
  movieUrlTemplate: movieUrlTemplateSchema().optional(),
  tvUrlTemplate: tvUrlTemplateSchema().optional(),
  /** @deprecated Use movieUrlTemplate */
  urlTemplate: movieUrlTemplateSchema().optional(),
  sourceLabel: z.string().min(1).optional(),
  iframeSandboxEnabled: z.boolean().optional(),
  iframeSandboxPolicy: z.string().min(1).optional(),
  iframeAllow: z.string().min(1).optional(),
});

export const embedConnectorConfigSchema = embedConnectorInputSchema
  .superRefine((data, ctx) => {
    if (!data.movieUrlTemplate && !data.urlTemplate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'movieUrlTemplate (or legacy urlTemplate) is required',
        path: ['movieUrlTemplate'],
      });
    }
  })
  .transform((data) => ({
    kind: 'embed' as const,
    movieUrlTemplate: data.movieUrlTemplate ?? data.urlTemplate!,
    ...(data.tvUrlTemplate ? { tvUrlTemplate: data.tvUrlTemplate } : {}),
    ...(data.sourceLabel ? { sourceLabel: data.sourceLabel } : {}),
    ...(data.iframeSandboxEnabled != null
      ? { iframeSandboxEnabled: data.iframeSandboxEnabled }
      : {}),
    ...(data.iframeSandboxPolicy ? { iframeSandboxPolicy: data.iframeSandboxPolicy } : {}),
    ...(data.iframeAllow ? { iframeAllow: data.iframeAllow } : {}),
  }));

export const manifestConnectorConfigSchema = z.object({
  kind: z.literal('manifest'),
  manifestUrl: z.string().url(),
  timeoutMs: z.number().int().positive().max(60_000).optional(),
});

export const connectorConfigSchema = z.union([
  demoConnectorConfigSchema,
  manualConnectorConfigSchema,
  httpConnectorConfigSchema,
  embedConnectorConfigSchema,
  manifestConnectorConfigSchema,
]);

export type ConnectorKind = z.infer<typeof connectorKindSchema>;
export type DemoConnectorConfig = z.infer<typeof demoConnectorConfigSchema>;
export type ManualConnectorConfig = z.infer<typeof manualConnectorConfigSchema>;
export type HttpConnectorConfig = z.infer<typeof httpConnectorConfigSchema>;
export type EmbedConnectorConfig = z.infer<typeof embedConnectorConfigSchema>;
export type ManifestConnectorConfig = z.infer<typeof manifestConnectorConfigSchema>;
export type ConnectorConfig = z.infer<typeof connectorConfigSchema>;
