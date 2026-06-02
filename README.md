# Movie Streamer

White-label, self-hosted streaming UI platform. Phase 1 adds TMDB browse/search/detail and demo HLS playback via Shaka Player.

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 9+
- [Docker](https://www.docker.com/) (optional, for Compose dev stack)
- [TMDB API key](https://www.themoviedb.org/settings/api) (required for Phase 1 catalog)

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

4. Set `TMDB_API_KEY` in `.env` (get a key from [TMDB](https://www.themoviedb.org/settings/api)).

## Local development (no Docker)

Terminal 1 — API (requires PostgreSQL; use Compose postgres only if desired):

```bash
# Example: start postgres via Docker
docker compose -f docker-compose.dev.yml up postgres -d

export DATABASE_URL=postgresql://movie:movie@localhost:5432/movie_streamer
export APP_MODE=production
export TMDB_API_KEY=your_key_here
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
docker compose -f docker-compose.dev.yml up --build
```

- Web: http://localhost:5173
- API: http://localhost:3001
- PostgreSQL: localhost:5432

**Windows/macOS:** Compose uses named volumes for `node_modules` so Linux containers do not use your host’s `node_modules` (pnpm symlinks break across OS boundaries). The first `up` may take a few minutes while `api` runs `pnpm install`. If you changed dependencies, recreate volumes:

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up
```

**Hot reload in Docker:** File watching and Vite HMR are configured for Docker (polling + `localhost` HMR host). After changing `vite.config.ts`, recreate the web container: `docker compose -f docker-compose.dev.yml up -d --force-recreate web`. For the fastest edit-refresh loop on Windows, run `pnpm dev:web` on the host and keep only postgres/api in Docker.

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

## Phase 1 — Browse and play

With `TMDB_API_KEY` set:

1. Open http://localhost:5173 — browse trending, popular movies, and TV rows.
2. Use **Search** to find titles.
3. Open a movie or TV detail page and click **Play**.
4. The play page loads a legal demo HLS stream (same for all titles in Phase 1).

API catalog routes (via web proxy): `/api/v1/catalog/home`, `/api/v1/catalog/search?q=`, `/api/v1/catalog/movie/:id`, `/api/v1/catalog/tv/:id`, `/api/v1/play/demo`.

## Phase 0 scope

Included: monorepo, shared Zod contracts, health API, web shell, Compose dev stack.

Phase 1 adds: TMDB catalog API, browse/search/detail UI, Shaka demo playback.

Not included: connector resolve, source picker, theming, Deploy Pack.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full roadmap.
