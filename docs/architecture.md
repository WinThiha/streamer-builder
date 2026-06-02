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
- Resolve v1 request/response — `mediaRef` in, `sources[]` out

API and future connectors import the same types.

## Phase 1 catalog and playback

- **TMDB proxy:** API routes under `/v1/catalog/*` fetch TMDB server-side and return normalized DTOs.
- **Demo playback:** `GET /v1/play/demo` returns one legal HLS `Source`; web uses Shaka Player on `/play`.
- **MediaRef:** Detail pages construct shared `MediaRef` objects passed to the play page via router state.
- **No resolve yet:** `POST /api/v1/play/resolve` and connector orchestration are Phase 2.

## App modes

`APP_MODE=production | prototype` is validated at API startup. Behavior branching arrives in Phase 5 (vendor prototype routes).

## Local development

- **Without Docker:** `pnpm install`, set `.env`, run `pnpm dev:api` and `pnpm dev:web`. Web proxies `/api` → `http://localhost:3001`.
- **With Docker:** `docker compose -f docker-compose.dev.yml up`.

## Production (deferred)

Customer Deploy Pack (Phase 4): Caddy → static web + API → PostgreSQL. See [docker/production/README.md](../docker/production/README.md).
