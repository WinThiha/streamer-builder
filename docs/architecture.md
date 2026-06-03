# Architecture — stack decisions

This document records technology choices for the movie streamer monorepo. See [ROADMAP.md](./ROADMAP.md) for product phases.

## Summary

| Layer | Choice | Notes |
|-------|--------|--------|
| Language | TypeScript (strict) | End-to-end typing |
| Monorepo | pnpm workspaces | `apps/web`, `apps/api`, `packages/shared` |
| Web | Vite + React 19 + React Router | SPA; not Next.js |
| Server state | TanStack Query | API/cache on client |
| API | Hono on Node 22 | Lightweight, `@hono/node-server` |
| Metadata | TMDB v3 (server-side) | `TMDB_API_KEY` never exposed to browser |
| Database | PostgreSQL 16 | Self-hosted per customer |
| ORM | Drizzle | TypeScript-first |
| Validation | Zod in `@movie-streamer/shared` | Shared connector contract |
| Styling | Tailwind CSS 4 + CSS variables | Tenant themes in Phase 3 |
| UI components | shadcn/ui direction | Admin/forms in later phases |
| Player | Shaka Player | HLS demo playback in Phase 1 |
| Dev runtime | Docker Compose | postgres, api, web |
| Production proxy | Caddy (Phase 4) | TLS + static + `/api` reverse proxy |

## Why not Next.js?

The product is a rich client streaming UI with a separate API and self-hosted static deploy. Vite + React gives fast dev, clear separation, and matches the Caddy + SPA production model without App Router complexity.

## Shared connector contract

`packages/shared` exports Zod schemas for:

- `MediaRef` — provider, type, id, optional season/episode
- `Source` — playback option from a connector
- Resolve v1 request/response — `mediaRef` in, optional `metadata`, `sources[]` out
- Connector configs — `demo`, `manual` (static sources), `http` (customer resolver URL)

API and connectors import the same types. See [connector-contract-v1.md](./connector-contract-v1.md).

## Phase 1 catalog and playback

- **TMDB proxy:** API routes under `/v1/catalog/*` fetch TMDB server-side and return normalized DTOs.
- **MediaRef:** Detail pages construct shared `MediaRef` objects passed to the play page via router state.

## Phase 2 resolve and connectors

- **Persistence:** `connectors` table in PostgreSQL (Drizzle); migrations on API startup and via `db:migrate`.
- **Resolve:** `POST /v1/play/resolve` runs enabled connectors in parallel, validates sources, merges with dedupe by URL, caches in memory (~15m).
- **Admin:** `/v1/admin/connectors` CRUD + Test (unauthenticated in local dev).
- **Web:** Play page resolves and shows source picker; Shaka plays `hls` / `progressive`; `embed` deferred in UI.
- **Legacy:** `GET /v1/play/demo` retained for simple demo access.

## App modes

`APP_MODE=production | prototype` is validated at API startup. Behavior branching arrives in Phase 5 (vendor prototype routes).

## Local development

- **Without Docker:** `pnpm install`, set `.env`, run `pnpm dev:api` and `pnpm dev:web`. Web proxies `/api` → `http://localhost:3001`.
- **With Docker:** `docker compose -f docker-compose.dev.yml up`.

## Production (deferred)

Customer Deploy Pack (Phase 4): Caddy → static web + API → PostgreSQL. See [docker/production/README.md](../docker/production/README.md).
