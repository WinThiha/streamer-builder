## Why

Phases 0–3 deliver a working streaming UI with connectors, white-label admin, and local Docker dev — but there is no way for a customer to install and run their own instance on a VPS with minimal DevOps. Phase 4 closes that gap: an operator can unzip a Deploy Pack, run install, complete first-run setup, and operate a live branded site on their domain. This unlocks Phase 5 (vendor prototype + web wizard) and Phase 6 hardening.

## What Changes

- Add customer Deploy Pack templates: production `docker-compose.yml`, Caddy TLS/static/API proxy, production Dockerfiles, `.env.example`, and persistent volumes for Postgres, uploads, and Caddy data.
- Default to versioned prebuilt container images (`API_IMAGE`, `WEB_IMAGE`, `IMAGE_TAG`) with a `docker-compose.build.yml` override for local builds from source.
- Add hybrid first-run setup: `.env` handles infrastructure (domain, DB credentials, generated secrets, image tags, ACME email); `/setup` handles product bootstrap (admin password, TMDB key, optional first connector, initial site publish).
- Add setup state persistence and setup API so the API can boot before setup is complete without requiring `TMDB_API_KEY` in environment.
- Add admin authentication (signed HTTP-only session cookie) and protect `/v1/admin/*` routes in production deployments.
- Add web `/setup` and `/admin/login` routes; gate admin shell behind auth and redirect incomplete installs to setup.
- Add operator scripts: `install.sh`, `update.sh`, `backup.sh`, and `QUICKSTART.md`.
- Include optional `site.config.yaml` in the pack as a bootstrap/import artifact only; PostgreSQL remains the runtime source of truth for site config.

**Out of scope:** Vendor marketing site, `/prototype` routes, web wizard pack generation (Phase 5), stream proxy/DRM, SSRF hardening (Phase 6), multi-tenant DB, external object storage.

**Non-breaking:** Local dev without Docker can keep convenient unauthenticated admin when `NODE_ENV=development` and setup is marked complete or auth is explicitly disabled for dev.

## Capabilities

### New Capabilities

- `deploy-pack-packaging`: Production Dockerfiles, customer Compose/Caddy templates, env template, image tag parameters, and volume layout for VPS deployment.
- `first-run-setup`: Setup state persistence, setup status/completion API, and `/setup` web flow for admin password, TMDB key, first connector, and initial publish.
- `admin-auth`: Admin login/logout/session validation; production protection of admin API routes and web admin shell.
- `operator-scripts`: `install.sh`, `update.sh`, `backup.sh`, and operator documentation for install, update, backup, and troubleshooting.

### Modified Capabilities

- `api-foundation`: Environment validation allows boot before setup; mount setup and auth route groups; health reflects setup state where applicable.
- `web-foundation`: Add `/setup` and `/admin/login` routes; redirect logic for incomplete setup and unauthenticated admin access.
- `tmdb-catalog-api`: TMDB key sourced from persisted setup state (with env fallback); catalog routes return appropriate errors when TMDB is not yet configured.
- `connector-admin-api`: Admin connector routes require authentication in production after setup is complete.
- `site-config-api`: Admin site routes require authentication in production after setup is complete.
- `site-admin-ui`: Admin shell requires login in production; setup flow includes first connector bootstrap step.

## Impact

- **Packaging:** New files under `docker/production/` (compose, Caddyfile, scripts, QUICKSTART); production Dockerfiles in `apps/api` and `apps/web`.
- **API:** New setup/admin auth tables and migration; setup and auth routes; auth middleware on admin route groups; env schema changes in `apps/api/src/env.ts`; TMDB client reads persisted key.
- **Web:** New setup and login pages; auth context/guards; connector bootstrap form; route guards in `App.tsx` and `AdminShell.tsx`.
- **Docs:** Update `docs/architecture.md`, `docs/ROADMAP.md`, `README.md`, and `docker/production/README.md`.
- **Downstream:** Phase 5 wizard generates packs from these templates; Phase 6 adds SSRF and operational hardening on top of this baseline.
