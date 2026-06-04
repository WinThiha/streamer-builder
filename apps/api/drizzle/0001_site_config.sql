CREATE TABLE IF NOT EXISTS site_config (
  id text PRIMARY KEY,
  draft jsonb NOT NULL,
  published jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);
