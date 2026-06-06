# Customer Deploy Pack — Quickstart

Install a self-hosted Movie Streamer instance on a VPS with Docker.

## Prerequisites

- Linux VPS (2 GB+ RAM recommended)
- Docker Engine with Compose plugin
- Domain name with DNS A/AAAA record pointing to the server
- TMDB API key from [themoviedb.org](https://www.themoviedb.org/settings/api)

## Install

1. Unzip the Deploy Pack on your server and `cd` into `docker/production/`.
2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env`:
   - `DOMAIN` — your public hostname
   - `ACME_EMAIL` — for Let's Encrypt TLS
   - `POSTGRES_PASSWORD` — strong database password
   - `SESSION_SECRET` — at least 32 random characters
   - `API_IMAGE`, `WEB_IMAGE`, `IMAGE_TAG` — your registry images (or use local build)

4. Run install:

   ```bash
   chmod +x scripts/*.sh
   ./scripts/install.sh
   ```

   For local builds from source:

   ```bash
   USE_LOCAL_BUILD=true ./scripts/install.sh
   ```

5. Open `https://YOUR_DOMAIN/setup` and complete first-run setup:
   - Admin password
   - TMDB API key
   - Optional first connector (embed URL template, HTTP resolver, or manual HLS URL)

6. Sign in at `/admin/login`, configure branding, and publish.

## Verify playback

1. Browse the home page at `/`.
2. Open a title and click **Play**.
3. Pick a source from the source picker (HLS/progressive use Shaka; embed sources load in an iframe).

## Add an embed connector (admin UI)

1. Sign in at `/admin/login`.
2. Open **Admin → Sources**.
3. Click **Add embed**, paste your URL template (must include `{id}`), and save.
4. Use **Test** with a TMDB id, or **Open in Play** to verify iframe playback.

Example template:

```text
https://player.example/embed/{type}/{id}?s={season}&e={episode}
```

## Add an embed connector (API)

```bash
curl -X POST "https://YOUR_DOMAIN/api/v1/admin/connectors" \
  -H "Content-Type: application/json" \
  -b "session=YOUR_SESSION_COOKIE" \
  -d '{
    "label": "My embed",
    "kind": "embed",
    "enabled": true,
    "priority": 50,
    "config": {
      "kind": "embed",
      "urlTemplate": "https://player.example/movie/{id}"
    }
  }'
```

Test:

```bash
curl -X POST "https://YOUR_DOMAIN/api/v1/admin/connectors/CONNECTOR_ID/test" \
  -H "Content-Type: application/json" \
  -b "session=YOUR_SESSION_COOKIE" \
  -d '{"mediaRef":{"provider":"tmdb","type":"movie","id":"550"}}'
```

## Update

```bash
# Set new IMAGE_TAG in .env if needed
./scripts/update.sh
```

The API runs database migrations on startup.

## Backup

```bash
./scripts/backup.sh
```

Creates `backups/backup-TIMESTAMP/` with `database.sql` and `uploads.tar.gz`.

## Restore (overview)

1. Stop the stack: `docker compose down`
2. Restore Postgres: `docker compose up -d postgres`, then `psql` / `pg_restore` from `database.sql`
3. Restore uploads volume from `uploads.tar.gz`
4. Start full stack: `docker compose up -d`

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| TLS certificate fails | DNS propagated? Ports 80/443 open? `ACME_EMAIL` set? |
| `/setup` not loading | `docker compose logs caddy api` — API health at `/api/health` |
| Catalog empty / 503 | Complete setup with valid TMDB key |
| Admin 401 | Sign in at `/admin/login`; cookies require HTTPS when `COOKIE_SECURE=true` |
| Connector test fails | Resolver URL reachable from API container; check connector config in admin API |

## Optional bootstrap config

Place `site.config.yaml` in the pack root and set `SITE_CONFIG_BOOTSTRAP_PATH=./site.config.yaml` in `.env`. It is imported during setup (validated against the shared site config schema). PostgreSQL remains the runtime source of truth after import.
