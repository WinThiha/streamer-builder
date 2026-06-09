import { z } from 'zod';
import { siteConfigSchema } from './site-config.js';

export const deployPackKindSchema = z.enum(['deploy-only', 'full-source']);

export type DeployPackKind = z.infer<typeof deployPackKindSchema>;

export const wizardPayloadSchema = z.object({
  domain: z.string().min(1),
  acmeEmail: z.string().email().optional(),
  siteConfig: siteConfigSchema,
  packKind: deployPackKindSchema.default('deploy-only'),
  imageTag: z.string().min(1).default('latest'),
  apiImage: z.string().min(1).optional(),
  webImage: z.string().min(1).optional(),
});

export type WizardPayload = z.infer<typeof wizardPayloadSchema>;
