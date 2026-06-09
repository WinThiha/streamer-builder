# Testing left (Phases 5–7)

Manual verification still needed after the vendor prototype, hardening, and deploy-pack work landed. Use `APP_MODE=prototype` and `VITE_APP_MODE=prototype` in `.env` for prototype flows. Pack zip layout and install-path checks are deferred (see below).

## Prototype mode & vendor site (Phase 5)

- [ ] Gallery at `/` lists presets; `/prototype/:preset` loads subscriber shell without setup redirect
- [ ] `GET /health` reports `appMode: prototype` and `setupComplete: true` on fresh DB
- [ ] Non-demo connector CRUD rejected in prototype mode
- [ ] Configure wizard: preset query param seeds branding; live preview on step 2+
- [ ] Configure wizard step 4 downloads a zip for each pack type (smoke only; integrity checks deferred)

## Hardening (Phase 6)

- [ ] HTTP connector blocks private/loopback URLs (SSRF)
- [ ] Embed playback respects `playback.embedAllowlist` in site config
- [ ] Resolve cache honors `expiresAt` from connector responses
- [ ] `POST /v1/admin/play/resolve` returns diagnostics (admin auth required)
- [ ] Migration ledger (`schema_migrations`) records applied SQL; `0003_schema_migrations.sql` applies cleanly
- [ ] `docker/production/scripts/restore.sh` documented path works against a backup archive

## Low-risk Phase 7

- [ ] shadcn theme bridge: CSS variables from site config apply on subscriber pages
- [ ] `playback.connectorResolveMode: first-good` stops after first successful connector
- [ ] Manifest connector driver resolves configured manifest URLs

## Deferred (not in scope for this test pass)

### Pack generation integrity verification

End-to-end validation of generated zips and install paths — run after API recreate with `DEPLOY_PACK_REPO_ROOT` set.

**Deploy-only (registry images)**

- [ ] Zip is flat (no `movie-streamer/` root): compose, scripts, `.env`, `site.config.yaml` only
- [ ] No `docker-compose.build.yml` (root or under `docker/production/`)
- [ ] Shipped `scripts/install.sh` and `scripts/update.sh` contain no `USE_LOCAL_BUILD` or build override references
- [ ] Generated QUICKSTART/README describe registry pull + `./scripts/install.sh` only
- [ ] `POST /v1/vendor/pack`: `X-Pack-Kind` / `X-Pack-Bytes` match selection; wizard errors on tiny full-source response

**Full-source (local Docker build)**

- [ ] Zip root is `movie-streamer/` with `apps/api/src`, `apps/web/src`, `packages/shared/src`, `PACK_MANIFEST.txt`
- [ ] Root `docker-compose.build.yml` present; `docker/production/docker-compose.build.yml` includes it
- [ ] On a Linux host (or VM): unzip → `cd movie-streamer/docker/production` → `USE_LOCAL_BUILD=true ./scripts/install.sh` builds API/web images and stack starts
- [ ] `docker compose -f docker-compose.yml -f docker-compose.build.yml config` resolves build `context` to pack root
- [ ] API production image includes `/pack-source` when built from repo Dockerfile (vendor host pack download)

### Phase 7 optional modules

See `openspec/changes/archive/2026-06-08-phase-7-connector-expansions/DEFERRED.md` — Bunny/Vimeo adapters, custom domain wizard, source health scoring, upload/transcode, full catalog manifest.

## Dev environment smoke

```bash
docker compose -f docker-compose.dev.yml up -d --force-recreate api
curl -s http://localhost:3001/health
```
