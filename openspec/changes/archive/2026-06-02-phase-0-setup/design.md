## Context

Greenfield repository for a white-label, self-hosted streaming UI platform (see [docs/ROADMAP.md](../../../docs/ROADMAP.md)). Phase 0 must deliver a runnable local dev environment and shared connector contract types before Phase 1 (browse/play). Stack choices favor portfolio signal (popular, modern tools) and product fit (SPA + API + self-hosted Docker), not a Next.js full-stack monolith.

## Goals / Non-Goals

**Goals:**

- Single pnpm monorepo with `apps/web`, `apps/api`, `packages/shared`.
- Documented architecture ADR in `docs/architecture.md`.
- Shared Zod schemas for connector contract v1 (`MediaRef`, `Source`, resolve).
- Placeholder API (Hono + health + DB) and web (Vite + React shell).
- Docker Compose dev: PostgreSQL 16, API `:3001`, web `:5173` with `/api` proxy to API.
- Strict TypeScript, ESLint, Prettier; `.env.example` and README.

**Non-Goals:**

- TMDB integration, playback, connectors, admin CRUD, theming, Shaka Player wiring.
- Production Deploy Pack, Caddy TLS, wizard, `APP_MODE=prototype` routes.
- Redis, multi-tenant DB, auth flows beyond env placeholders (`JWT_SECRET` in `.env.example` only).

## Decisions

### Monorepo: pnpm workspaces

**Choice:** pnpm with `apps/*` and `packages/*`.

**Rationale:** Fast installs, strict dependency hoisting, common in TypeScript monorepos. Matches roadmap.

**Alternatives:** npm workspaces (slower), Turborepo (defer until build caching matters).

### Frontend: Vite + React + React Router (not Next.js)

**Choice:** SPA in `apps/web` with Vite, React 19, React Router, TanStack Query for server state.

**Rationale:** Product is a rich client streaming UI + admin; no SSR requirement in Phase 0. Vite has high DX and performance. Next.js adds complexity without Phase 0 benefit; still portfolio-relevant via React ecosystem.

**Alternatives:** Next.js (popular but heavier for self-hosted static + separate API model).

### API: Hono on Node 22

**Choice:** Hono in `apps/api`, served via `@hono/node-server`.

**Rationale:** Lightweight, TypeScript-native, fast to scaffold. Fits separate API behind Caddy in production.

**Alternatives:** Express (more boilerplate), Fastify (heavier for placeholder phase).

### Data: PostgreSQL 16 + Drizzle

**Choice:** PostgreSQL in Docker; Drizzle ORM with minimal schema (e.g. migration placeholder or empty schema file).

**Rationale:** Roadmap and Stack Overflow survey alignment; Drizzle pairs well with TypeScript and Zod culture.

**Alternatives:** Prisma (heavier codegen), SQLite (wrong for production deploy target).

### Contracts: Zod in `packages/shared`

**Choice:** All cross-boundary types (`MediaRef`, `Source`, resolve request/response) defined once with Zod; export `z.infer` types.

**Rationale:** Single source of truth for API and future connectors; Phase 2 contract doc will reference same shapes.

### Styling: Tailwind + CSS variables; shadcn/ui prep

**Choice:** Tailwind v4 (or v3 per scaffold defaults); CSS variables for future tenant themes; shadcn-compatible `components/ui` folder structure without full admin UI.

**Rationale:** Roadmap white-label theming path; shadcn for admin/forms in later phases.

### Player (document only)

**Choice:** Record Shaka Player as Phase 1 direction in `docs/architecture.md`; do not install in Phase 0.

**Rationale:** Serious HLS/DASH signal for portfolio; not needed until browse/play.

### Dev Docker topology

```
┌─────────┐     /api proxy      ┌─────────┐
│  web    │ ──────────────────▶ │  api    │
│  :5173  │                     │  :3001  │
└─────────┘                     └────┬────┘
                                     │
                              ┌──────▼──────┐
                              │  postgres   │
                              │  :5432      │
                              └─────────────┘
```

**Production placeholder:** `docker/production/` with README pointing to Phase 4 Caddy + static + API layout (no implementation).

### App mode env

**Choice:** `APP_MODE=production|prototype` in `.env.example`; API validates enum; no behavior branching yet.

**Rationale:** Roadmap requires same codebase for vendor prototype vs customer production later.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| shadcn init complexity in monorepo | Minimal Tailwind + one placeholder component; full shadcn CLI in Phase 3 admin |
| Docker on Windows path/line endings | Document WSL2/Docker Desktop; use named volumes for `node_modules` if needed |
| Shared package resolution in Vite | Use `workspace:*` and Vite `resolve.dedupe` / tsconfig paths as needed |
| Over-scoping Phase 0 | Strict checklist; specs mark SHALL only for foundation behaviors |

## Migration Plan

N/A — greenfield. First commit establishes structure. Developers clone, copy `.env.example` → `.env`, run `pnpm install` and `docker compose -f docker-compose.dev.yml up`.

## Open Questions

- None blocking Phase 0. TanStack Query version pinned at scaffold time; Shaka vs video.js finalized in Phase 1 ADR update if needed.
