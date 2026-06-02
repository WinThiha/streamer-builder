import { z } from 'zod';

const DEFAULT_DEMO_HLS_URL =
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_MODE: z.enum(['production', 'prototype']),
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  TMDB_API_KEY: z.string().min(1),
  DEMO_HLS_URL: z.string().url().default(DEFAULT_DEMO_HLS_URL),
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
