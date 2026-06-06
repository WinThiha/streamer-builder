CREATE TABLE IF NOT EXISTS deployment_settings (
  id text PRIMARY KEY,
  admin_password_hash text,
  tmdb_api_key text,
  setup_completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
