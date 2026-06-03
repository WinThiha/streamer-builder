# Movie Streamer — Product Roadmap (Phases)

White-label, self-hosted streaming **UI platform**: Netflix-like browse and play, per-tenant themes and layouts, playback via **content source connectors** (no required uploads). You ship deploy-ready bundles and a marketing site with legal demo streams only; customers run their own infrastructure and configure their own sources.

---

## Product model (summary)

| Topic | Decision |
|-------|----------|
| What you provide | Web UI, API, Deploy Pack generator, connector contract — not hosted video |
| Customer hosting | Self-hosted (Docker Compose on their VPS); you do not host their streams |
| Content | TMDB (or similar) for metadata; playback from customer-configured sources |
| Uploads / transcode | Not required for core product; optional later module |
| Production tenancy | One branded site per deployment (`site.config` + admin UI) |
| Your site (`mysite.com`) | `/prototype/:preset` (legal demo sources only) + web wizard → Deploy Pack |
| Customer site | Full admin: branding, connectors, TMDB key, etc. — their responsibility |
| Prototype URL | `https://mysite.com/prototype/{preset}` (shared sample catalog, styles differ) |

---

## Phase overview

```
  Phase 0  Project setup & tech stack
  Phase 1  Browse & play (single source, local)
  Phase 2  Source connector contract (multi-server)
  Phase 3  White-label (theme + layout)
  Phase 4  Deploy-ready package (customer install)
  Phase 5  Vendor site (prototype + web wizard)
  Phase 6  Hardening & operator quality
  Phase 7  Optional expansions
```

```
  Phase 0 ──▶ Phase 1 ──▶ Phase 2 ──▶ Phase 3 ──▶ Phase 4
                                        │
                                        └──▶ Phase 5 (needs 3 + 4)
  Phase 6 after Phase 4 (ongoing)
  Phase 7 after Phase 2 (à la carte)
```

---

## Phase 0 — Project setup & tech stack

**Goal:** One repo, local dev environment, shared types for the connector contract, Docker dev stack, documented stack choices.

**Done when:**

- `pnpm install` works
- `docker compose up` → API + DB + web (placeholders OK)
- `packages/shared` exports `MediaRef`, `Source`, resolve types (Zod schemas)
- README: prerequisites, env vars, folder map
- Short ADR or `docs/architecture.md` records stack decisions

### Recommended stack

| Layer | Choice |
|-------|--------|
| Language | TypeScript |
| Monorepo | pnpm workspaces (`apps/web`, `apps/api`, `packages/shared`) |
| Web | Vite + React + React Router |
| API | Hono on Node 22 |
| Database | PostgreSQL 16 |
| ORM | Drizzle |
| Validation | Zod (in `shared` where possible) |
| Styling | Tailwind + CSS variables for tenant theme |
| UI components | shadcn/ui (admin/forms) |
| Player | Shaka Player or video.js + hls.js |
| Production proxy | Caddy (TLS + static + `/api` reverse proxy) |
| App modes | `APP_MODE=production` \| `prototype` (same codebase) |

### Phase 0 tasks

- [x] 0.1 Write stack ADR (`docs/architecture.md`)
- [x] 0.2 Init monorepo (pnpm workspaces)
- [x] 0.3 `packages/shared` — types + Zod for MediaRef, Source, resolve v1
- [x] 0.4 `apps/api` — health route, env validation, DB connection
- [x] 0.5 `apps/web` — shell layout, API URL env, placeholder routes
- [x] 0.6 `docker-compose.dev.yml` — postgres, api, web
- [x] 0.7 `.env.example` — `TMDB_API_KEY`, `DATABASE_URL`, `APP_MODE`, `JWT_SECRET`, etc.
- [x] 0.8 ESLint, Prettier, TypeScript strict
- [x] 0.9 README — Docker, Node 22, pnpm, dev commands
- [x] 0.10 `docker/production/` template folder for future Deploy Pack

### Dev / prod Docker shape

**Dev:** `postgres:5432`, `api:3001`, `web:5173` (Vite; proxy `/api` to API)

**Production (customer pack):** `caddy:443` → static web + `/api` → `api:3001`, `postgres` (no Redis in v1)

### Explicitly out of scope in Phase 0

TMDB UI, connectors, wizard, theming, Deploy Pack generation.

---

## Phase 1 — Browse & play (single source, local only)

**Goal:** App feels like a streaming site on localhost; no deploy, no multi-source, no wizard.

| Build | Skip |
|-------|------|
| App skeleton wired (web + API + DB) | Docker production pack |
| TMDB: home rows, detail, search | Multiple connectors |
| `mediaRef` (tmdb movie / tv + season / episode) | Per-tenant themes |
| One hardcoded demo HLS on Play | Source picker |
| Basic HLS player | Customer admin |

**Done when:** Localhost → browse → open title → video plays.

```
  [ TMDB metadata ] → [ Detail ] → [ Play ] → demo HLS
```

---

## Phase 2 — Source connector contract (multi-server UX)

**Goal:** Cineby-like server picker; contract v1 documented; still single-tenant local.

| Build | Skip |
|-------|------|
| `POST /api/v1/play/resolve` + orchestrator | Deploy pack |
| Connector types: `http`, `manual`, `demo` | Full branding system |
| Merge, sort, cap sources; basic cache (TTL) | `/prototype` routes |
| Source picker in subscriber UI | Stream proxy / DRM |
| Minimal admin API: connector CRUD + Test | Fancy setup wizard |

**Done when:** Two sources appear in picker; admin Test works; `docs/connector-contract-v1.md` matches `packages/shared`.

### Connector contract (v1 summary)

- **Resolve request:** `mediaRef` (`provider`, `type`, `id`, optional `season` / `episode`)
- **Resolve response:** `sources[]` with `id`, `connectorId`, `label`, `kind` (`hls` \| `progressive` \| `embed`), `url`, optional `expiresAt`, `subtitles`
- **HTTP connector:** POST `mediaRef` (+ optional TMDB metadata) to customer URL; they return `sources[]`
- **Orchestrator:** parallel resolve by default, merge, dedupe, cache (~15m or `expiresAt`)

**Done when:** Play → resolve → pick server → player.

---

## Phase 3 — White-label (production mode, one site)

**Goal:** Look and layout from config; editable in customer admin without redeploy.

| Build | Skip |
|-------|------|
| `site.config` (theme tokens, `templateId`, homepage blocks) | Path-based `/prototype` on customer deploy |
| `APP_MODE=production` — single tenant from config | Web wizard on vendor domain |
| 2 layout presets (e.g. hero-rows, grid-first) | Full drag-drop page builder |
| Customer admin: colors, logo, template | Connector marketplace |

**Done when:** Change theme/template in admin → subscriber site updates.

---

## Phase 4 — Deploy-ready (customer runs their instance)

**Goal:** Customer can unzip, install, run setup, use admin — minimal DevOps.

| Build | Skip |
|-------|------|
| `docker-compose.yml` + `install.sh` + healthchecks | Vendor marketing site |
| Caddy + domain from `.env` | Transcode / upload worker |
| First-run setup UI: domain, admin password, TMDB key, first connector | |
| Deploy Pack: compose + `site.config` + generated secrets | |
| Basic `update.sh` + QUICKSTART.md | |

**Done when:** Fresh machine → install → setup → add connector → play on customer domain.

```
  Deploy Pack → install.sh → setup wizard → admin → live site
```

### Deploy Pack contents (target)

```
  customer-bundle/
  ├── docker-compose.yml
  ├── install.sh
  ├── .env
  ├── site.config.yaml
  ├── Caddyfile (or equivalent)
  ├── scripts/backup.sh, update.sh
  └── QUICKSTART.md
```

---

## Phase 5 — Vendor site (legal demo + web wizard)

**Goal:** Sell the product; no customer streams on your infrastructure.

| Build | Skip |
|-------|------|
| `APP_MODE=prototype` on vendor host only | Piracy / unlicensed embeds on your domain |
| `/prototype/:preset` — shared catalog, legal demo sources only | Hosting customer video |
| Prototype gallery linking presets | |
| Web wizard → download Deploy Pack (brand/layout/domain) | |
| Wizard live preview | |
| Optional: `/preview/:sessionId` shareable preview links | |

**Done when:** Visitor tries `/prototype/fitness` → configures in wizard → downloads pack matching that look.

```
  mysite.com/prototype/*  →  /configure  →  Deploy Pack (.zip)
```

### Vendor vs customer

| | Vendor site | Customer deploy |
|--|-------------|-----------------|
| Connectors | `demo` + legal allowlist only | Whatever they configure |
| Catalog | Shared seed + TMDB | Their TMDB key + their resolvers |
| URLs | `/prototype/{slug}/...` | `/` at their domain |

---

## Phase 6 — Hardening & operator quality

| Item | Priority |
|------|----------|
| Resolve caching + `expiresAt` | High |
| SSRF / URL validation on HTTP connectors | High |
| `embedAllowlist` per tenant (optional) | Medium |
| `partial` resolves + admin-only error detail | Medium |
| Backup script, DB migrations story | Medium |
| Hide vs grey-out titles with no sources | Product choice |
| Signed URL stream proxy | Later |

---

## Phase 7 — Optional expansions

Implement only when needed:

| Module | When |
|--------|------|
| Manifest connector (static JSON catalog) | Large catalogs, fewer live resolves |
| Bunny / Vimeo adapters | Customers want forms, not HTTP resolver |
| Upload + transcode worker | Tenants need own files |
| Connector mode: first-good vs show-all | UX tuning |
| Custom domain automation in wizard | Polish |
| Source health / scoring | Many flaky sources |

---

## What we are not building (core product)

- Hosted video or default piracy index in your repo
- Multi-tenant database on customer deploy (one site per instance)
- Required upload pipeline in v1
- You operating customer streams

---

## Phase completion checklist (one line each)

| Phase | Done when |
|-------|-----------|
| **0** | Monorepo runs locally in Docker with shared types |
| **1** | Browse TMDB and play one demo stream |
| **2** | Connectors work and user can pick servers |
| **3** | Rebrand from admin without code changes |
| **4** | Someone can install from Deploy Pack on a fresh VPS |
| **5** | Prototype + wizard produce a branded pack |
| **6** | Safe and stable for long-running production |
| **7** | Optional modules as needed |

---

## Related docs

- `docs/architecture.md` — stack ADR (Phase 0, complete)
- `docs/connector-contract-v1.md` — normative connector API (Phase 2, implemented)
- `openspec/specs/` — capability specs synced from Phase 0
- `openspec/changes/archive/` — completed change proposals

---

*Last updated from product exploration, June 2026.*
