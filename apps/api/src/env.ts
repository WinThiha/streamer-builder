import { z } from 'zod';

const DEFAULT_DEMO_HLS_URL =
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8';

/** Compose and shell often pass "" for unset optional vars — treat as missing. */
function optionalNonEmptyString() {
  return z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    z.string().min(1).optional(),
  );
}

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1),
    APP_MODE: z.enum(['production', 'prototype']),
    PORT: z.coerce.number().int().positive().default(3001),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    TMDB_API_KEY: optionalNonEmptyString(),
    SESSION_SECRET: z.preprocess(
      (value) => (value === '' || value == null ? undefined : value),
      z.string().min(32).optional(),
    ),
    ADMIN_AUTH_DISABLED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    DEMO_HLS_URL: z.string().url().default(DEFAULT_DEMO_HLS_URL),
    UPLOAD_DIR: z.string().min(1).default('./data/uploads'),
    MAX_LOGO_BYTES: z.coerce.number().int().positive().default(2_097_152),
    SITE_CONFIG_BOOTSTRAP_PATH: optionalNonEmptyString(),
    COOKIE_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' && !data.SESSION_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'SESSION_SECRET is required in production',
        path: ['SESSION_SECRET'],
      });
    }
  });

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();

export function isProductionRuntime(): boolean {
  return env.NODE_ENV === 'production';
}

export function cookieSecureFlag(): boolean {
  return env.COOKIE_SECURE || env.NODE_ENV === 'production';
}
