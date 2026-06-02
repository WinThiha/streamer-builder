# Movie Streamer

White-label, self-hosted streaming UI platform. Phase 0 provides the monorepo foundation: shared connector types, API shell, web shell, and Docker dev stack.

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 9+
- [Docker](https://www.docker.com/) (optional, for Compose dev stack)

## Repository layout

```
apps/
  api/          Hono API (health, env, Drizzle + PostgreSQL)
  web/          Vite + React subscriber shell
packages/
  shared/       Zod schemas: MediaRef, Source, resolve v1
docs/
  ROADMAP.md    Product phases
  architecture.md  Stack ADR
docker/
  production/   Phase 4 placeholder
```

## Setup

1. Clone the repository.
2. Copy environment template:

   ```bash
   cp .env.example .env
   ```

3. Install dependencies and build shared package:

   ```bash
   pnpm install
   pnpm prepare:shared
   ```

## Local development (no Docker)

Terminal 1 — API (requires PostgreSQL; use Compose postgres only if desired):

```bash
# Example: start postgres via Docker
docker compose -f docker-compose.dev.yml up postgres -d

export DATABASE_URL=postgresql://movie:movie@localhost:5432/movie_streamer
export APP_MODE=production
pnpm dev:api
```

Terminal 2 — Web:

```bash
pnpm dev:web
```

- Web: http://localhost:5173
- API: http://localhost:3001/health
- Web proxies `/api/*` → API when `VITE_API_URL` is unset

## Docker development

```bash
docker compose -f docker-compose.dev.yml up
```

- Web: http://localhost:5173
- API: http://localhost:3001
- PostgreSQL: localhost:5432

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all workspace packages |
| `pnpm prepare:shared` | Build `@movie-streamer/shared` |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier write |
| `pnpm dev:api` | API dev server |
| `pnpm dev:web` | Vite dev server |
| `pnpm build` | Build all packages |

## Phase 0 scope

Included: monorepo, shared Zod contracts, health API, web shell, Compose dev stack.

Not included: TMDB, playback, connectors, theming, Deploy Pack, Shaka Player.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full roadmap.
