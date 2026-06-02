## Why

The movie streamer product needs a single, documented foundation before any browse/play, connector, or white-label work can begin. Phase 0 establishes the monorepo, shared connector contract types, placeholder apps, and Docker dev stack so later phases share one TypeScript codebase and validated contracts. This is the right time because the roadmap stack choices are settled and the repo is still empty.

## What Changes

- Initialize a pnpm workspace monorepo with `apps/web`, `apps/api`, and `packages/shared`.
- Add strict TypeScript, ESLint, and Prettier at the root.
- Document stack decisions in `docs/architecture.md` (portfolio-friendly choices: Vite + React, Hono, PostgreSQL + Drizzle, Zod, Tailwind, shadcn/ui, Shaka Player direction, Caddy-ready production layout).
- Export v1 connector contract types in `packages/shared` (`MediaRef`, `Source`, resolve request/response) as Zod schemas with inferred TypeScript types.
- Scaffold `apps/api` with Hono health route, env validation, and Drizzle/PostgreSQL connection placeholder.
- Scaffold `apps/web` with Vite + React + React Router shell, Tailwind, TanStack Query wiring, and API URL env handling.
- Add `docker-compose.dev.yml` for PostgreSQL, API, and web dev services.
- Add `.env.example`, README setup instructions, and `docker/production/` placeholder for future Deploy Pack.
- **Out of scope:** TMDB UI, connectors, theming, player integration, wizard, Deploy Pack generation.

## Capabilities

### New Capabilities

- `monorepo-tooling`: Root pnpm workspace, shared TypeScript/ESLint/Prettier config, and workspace scripts (`install`, `typecheck`, `lint`).
- `shared-connector-contract`: Zod schemas and types for `MediaRef`, `Source`, and resolve v1 in `packages/shared`.
- `api-foundation`: Hono API shell with `/health`, environment validation, and Drizzle PostgreSQL connection.
- `web-foundation`: Vite React app shell with routing, Tailwind, API env, and placeholder pages.
- `local-dev-docker`: Docker Compose dev stack (postgres, api, web) and `.env.example` for local development.

### Modified Capabilities

<!-- None — greenfield project -->

## Impact

- **New directories:** `apps/web`, `apps/api`, `packages/shared`, `docker/production`, root config files.
- **Docs:** `docs/architecture.md`, `README.md`, `.env.example`.
- **Dependencies:** Node 22, pnpm, PostgreSQL 16, Docker; no production customer deploy yet.
- **Downstream phases:** Phase 1+ depend on shared types and running local stack from this change.
