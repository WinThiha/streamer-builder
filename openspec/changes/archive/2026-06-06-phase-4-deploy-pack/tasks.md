## 1. Shared and database foundation

- [x] 1.1 Add deployment settings Zod schema to `packages/shared` (admin credential, TMDB key fields, setup status types)
- [x] 1.2 Add `deployment_settings` Drizzle schema and SQL migration `0002_deployment_settings.sql`
- [x] 1.3 Implement deployment settings repository (get, upsert, mark setup complete)
- [x] 1.4 Add optional `site.config.yaml` import helper validated against `siteConfigSchema`
- [x] 1.5 Rebuild shared package and verify API/web compile

## 2. API environment and TMDB runtime config

- [x] 2.1 Update `apps/api/src/env.ts`: require `SESSION_SECRET` in production; make `TMDB_API_KEY` optional at boot; add `ADMIN_AUTH_DISABLED` dev flag
- [x] 2.2 Refactor TMDB client construction to read persisted key with env fallback via deployment settings
- [x] 2.3 Return HTTP 503 from catalog routes when TMDB is not yet configured
- [x] 2.4 Update `.env.example` with production and dev auth variables

## 3. Setup API

- [x] 3.1 Implement `GET /v1/setup/status` route
- [x] 3.2 Implement `POST /v1/setup/complete` with password hashing, TMDB validation, optional connector create, site publish, and setup completion
- [x] 3.3 Wire setup routes in `apps/api/src/index.ts`; ensure bootstrap runs before requiring TMDB
- [x] 3.4 Block setup re-run after completion unless future admin reset is added (return 403/409)

## 4. Admin authentication API

- [x] 4.1 Implement session store or signed session token with HTTP-only cookie
- [x] 4.2 Add `POST /v1/admin/auth/login` and `POST /v1/admin/auth/logout`
- [x] 4.3 Add auth middleware protecting `/v1/admin/*` in production when setup complete
- [x] 4.4 Preserve dev bypass when `NODE_ENV=development` and `ADMIN_AUTH_DISABLED=true`
- [x] 4.5 Apply middleware to connector and site admin route groups

## 5. Production Dockerfiles and packaging

- [x] 5.1 Add production `apps/api/Dockerfile` (multi-stage build, include drizzle SQL, `node dist/index.js`)
- [x] 5.2 Add production `apps/web/Dockerfile` (Vite build with empty `VITE_API_URL`, static output for Caddy)
- [x] 5.3 Add `docker/production/docker-compose.yml` with caddy, api, postgres, healthchecks, volumes
- [x] 5.4 Add `docker/production/docker-compose.build.yml` build override
- [x] 5.5 Add `docker/production/Caddyfile` with TLS, SPA fallback, `/api` reverse proxy
- [x] 5.6 Add `docker/production/.env.example` with DOMAIN, ACME_EMAIL, image tags, secrets
- [x] 5.7 Update `docker/production/README.md` with topology and usage

## 6. Operator scripts and documentation

- [x] 6.1 Implement `docker/production/scripts/install.sh` (Docker check, env generation, compose up, health wait, print setup URL)
- [x] 6.2 Implement `docker/production/scripts/update.sh` (pull/recreate, health wait)
- [x] 6.3 Implement `docker/production/scripts/backup.sh` (pg_dump + uploads archive)
- [x] 6.4 Write `docker/production/QUICKSTART.md` (DNS, install, setup, connector test, update, backup, troubleshooting)
- [x] 6.5 Update root `README.md` and `docs/architecture.md` for Phase 4 production path

## 7. Web setup and auth UI

- [x] 7.1 Add setup and auth API helpers in `apps/web/src/lib/api.ts`
- [x] 7.2 Add auth context/provider for session state and login/logout
- [x] 7.3 Build `/setup` wizard page (admin password, TMDB key, optional connector step)
- [x] 7.4 Build `/admin/login` page
- [x] 7.5 Add route guards in `App.tsx` for setup incomplete and unauthenticated admin
- [x] 7.6 Gate `AdminShell` with logout action; redirect unauthenticated users to login

## 8. Verification

- [x] 8.1 Run `openspec validate phase-4-deploy-pack --strict`
- [x] 8.2 Run `pnpm typecheck` and `pnpm lint`
- [x] 8.3 Build production images locally via build override
- [x] 8.4 Smoke test: fresh compose → `/setup` → login → admin → connector test → play resolve
- [x] 8.5 Smoke test: `update.sh` and `backup.sh` on running stack
- [x] 8.6 Manual: verify production admin routes return 401 without session
