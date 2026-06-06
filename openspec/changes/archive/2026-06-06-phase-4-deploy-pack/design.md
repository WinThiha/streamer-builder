## Context

Phases 0–3 provide a monorepo streaming UI with TMDB catalog, connector resolve, white-label site config (draft/publish), and admin shell — all runnable locally via `docker-compose.dev.yml`. Production deployment is documented only as a placeholder in `docker/production/README.md`. Admin routes are intentionally unauthenticated for local dev. `TMDB_API_KEY` is required at API boot via `apps/api/src/env.ts`, which blocks a true first-run setup wizard.

Phase 4 targets self-hosted customer VPS installs with minimal DevOps: unzip pack → configure `.env` → `install.sh` → `/setup` → live site.

## Goals / Non-Goals

**Goals:**

- Deliver a customer Deploy Pack that runs API + static web + Postgres + Caddy on a fresh VPS.
- Support hybrid setup: infrastructure in `.env`, product bootstrap in `/setup`.
- Default to prebuilt registry images with local build override for testing.
- Protect admin APIs and UI in production with session-based auth.
- Provide install, update, and backup scripts plus operator documentation.
- Meet ROADMAP Phase 4 done-when: fresh machine → install → setup → add connector → play on customer domain.

**Non-Goals:**

- Vendor site, `/prototype` routes, or web wizard pack generation (Phase 5).
- `site.config.yaml` as runtime source of truth (import/bootstrap artifact only).
- Redis, stream proxy, SSRF hardening, or signed URL proxy (Phase 6+).
- Multi-tenant database or hosted video.

## Decisions

### 1. Hybrid setup split

**Decision:** `.env` owns `DOMAIN`, `ACME_EMAIL`, `DATABASE_URL`, Postgres credentials, `JWT_SECRET`/`SESSION_SECRET`, image tags, and Caddy-related settings. `/setup` owns admin password hash, TMDB API key (persisted), optional first connector, and marking setup complete with initial site publish.

**Rationale:** Domain/TLS and container secrets are operator/infra concerns best handled before or during `install.sh`. Product configuration belongs in the app so non-DevOps users can finish bootstrap in a browser.

**Alternatives considered:**
- Pack-time only: simpler but poor UX for TMDB/connector configuration.
- Runtime-only wizard: forces all config through UI including secrets already better suited to `.env`.

### 2. Prebuilt images with build override

**Decision:** Customer `docker-compose.yml` references `${API_IMAGE}:${IMAGE_TAG}` and `${WEB_IMAGE}:${IMAGE_TAG}`. A companion `docker-compose.build.yml` override builds from `apps/api/Dockerfile` and `apps/web/Dockerfile` when testing from source.

**Rationale:** Customers get fast installs without compiling on VPS; developers retain local validation path.

**Alternatives considered:**
- Build-on-VPS only: slow, fragile on small VPS instances.
- Prebuilt only: harder to test unreleased changes.

### 3. PostgreSQL as canonical config; YAML as bootstrap artifact

**Decision:** Site config continues to live in `site_config` table (Phase 3). Optional `site.config.yaml` in the pack is validated and imported into DB during setup or first boot seed — not read on every request.

**Rationale:** Phase 3 draft/publish workflow already targets DB. Avoids dual sources of truth.

### 4. Admin auth: signed HTTP-only session cookie

**Decision:** Use a server-side session record (or signed session token stored in DB) with an HTTP-only, Secure (in production), SameSite=Lax cookie. Login endpoint validates admin password; middleware protects `/v1/admin/*` when `NODE_ENV=production` and setup is complete.

**Rationale:** Browser admin UI is the primary consumer; cookie auth avoids token storage in localStorage. Single-tenant self-hosted fits simple session model.

**Alternatives considered:**
- Bearer JWT in localStorage: more XSS exposure.
- Basic auth at Caddy: doesn't integrate with setup wizard or per-route API semantics.

**Dev convenience:** When `NODE_ENV=development`, admin routes MAY remain unauthenticated if `ADMIN_AUTH_DISABLED=true` (documented in `.env.example`).

### 5. TMDB key persistence

**Decision:** Add `deployment_settings` (or equivalent) singleton table with `tmdb_api_key`, `setup_completed_at`, and admin credential hash. API boot requires only `DATABASE_URL` and core secrets; catalog routes return 503 with clear message until TMDB key is configured via setup.

**Rationale:** Enables stack to start and serve `/setup` and `/health` before operator enters TMDB key.

**Env fallback:** If `TMDB_API_KEY` is set in `.env`, it takes precedence or seeds the persisted value on first boot (design detail: prefer persisted value after setup; env used only when no DB value exists for migration compatibility).

### 6. Production topology (Caddy)

**Decision:**

```
Internet → Caddy :443
            ├─ /api/* → api:3001 (strip /api prefix or proxy as-is matching dev)
            └─ /*     → static web dist (SPA fallback to index.html)
         postgres (internal)
         api uploads volume
```

Web build uses empty `VITE_API_URL` so browser calls `/api/...` through Caddy, matching dev proxy behavior in `apps/web/src/lib/api.ts`.

**Local smoke test:** Document optional `DOMAIN=localhost` or HTTP-only Caddy block for compose testing without real DNS.

### 7. Setup flow and idempotency

**Decision:** `GET /v1/setup/status` returns `{ complete, steps }`. `POST /v1/setup/complete` accepts admin password, TMDB key, optional connector payload; validates; writes settings; creates/updates admin user; optionally creates first connector; publishes default or imported site config; sets `setup_completed_at`. After completion, `/setup` redirects to `/admin/login`. Re-running setup blocked unless authenticated admin invokes explicit reset (out of scope for v1 — document manual DB reset in QUICKSTART).

### 8. First connector in setup

**Decision:** Setup wizard supports `http` and `manual` connector kinds (matching shared schemas). Demo connector remains seeded for immediate play; operator can add real connector during setup or later in admin.

## Risks / Trade-offs

- **[Risk] Caddy ACME fails without DNS** → QUICKSTART documents A/AAAA record requirements; health check waits; troubleshooting section for certificate errors.
- **[Risk] Unauthenticated admin in dev vs production divergence** → Explicit env flag and tests for production middleware path.
- **[Risk] TMDB key in DB vs env confusion** → Document precedence; setup UI shows key is stored server-side only.
- **[Risk] Update script breaks on schema migration** → API runs migrations on boot; update.sh documents backup-before-update.
- **[Trade-off] No connector admin UI beyond setup step** → Phase 4 adds minimal setup connector form; full connector CRUD UI deferred; curl/API documented in QUICKSTART.

## Migration Plan

1. Implement API setup/auth before enabling production compose defaults.
2. Add production Dockerfiles and validate build override locally.
3. Ship pack templates and scripts; test fresh install on clean Compose project.
4. Update README/architecture; archive change and sync specs.
5. **Rollback:** `docker compose down`; restore Postgres backup from `backup.sh`; redeploy previous image tag via `update.sh`.

## Open Questions

- Registry namespace for prebuilt images (e.g. `ghcr.io/org/movie-streamer-api`) — finalize at publish time; parameterized in `.env.example`.
- Whether setup should import `site.config.yaml` automatically on first boot or only when file is present — default: import when present, else use `defaultSiteConfig`.
