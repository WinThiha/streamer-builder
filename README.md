# Movie Streamer

White-label, self-hosted streaming UI platform. Phase 1 adds TMDB browse/search/detail; Phase 2 adds multi-source resolve and connector admin API; Phase 3 adds white-label site config (draft/publish), admin shell, and runtime theming.

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
  shared/       Zod schemas: MediaRef, Source, resolve v1, connector configs
docs/
  ROADMAP.md    Product phases
  architecture.md  Stack ADR
  connector-contract-v1.md  Normative resolve API
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
| `pnpm --filter @movie-streamer/api db:migrate` | Apply SQL migrations |
| `pnpm --filter @movie-streamer/api db:seed` | Seed site config + demo/manual connectors |

## Phase 1 — Browse and play

With `TMDB_API_KEY` set:

1. Open http://localhost:5173 — browse trending, popular movies, and TV rows.
2. Use **Search** to find titles.
3. Open a movie or TV detail page and click **Play**.

## Phase 2 — Connectors and source picker

On API startup (or after `db:migrate` + `db:seed`), default **demo** and **manual** connectors are seeded. Play resolves sources from all enabled connectors.

1. Browse to a title and click **Play**.
2. The play page calls `POST /api/v1/play/resolve` and shows a **source picker** when multiple streams are returned.
3. Switch sources to change the Shaka Player stream.

API routes (via web proxy):

- `POST /api/v1/play/resolve` — resolve `mediaRef` to `sources[]`
- `GET /api/v1/play/demo` — single demo source (legacy/dev)
- `GET /api/v1/admin/connectors` — list connectors
- `POST /api/v1/admin/connectors` — create connector
- `PATCH /api/v1/admin/connectors/:id` — update connector
- `DELETE /api/v1/admin/connectors/:id` — delete connector
- `POST /api/v1/admin/connectors/:id/test` — test connector with a `mediaRef`

See [docs/connector-contract-v1.md](docs/connector-contract-v1.md) for request/response shapes.

## Phase 3 — White-label and admin

On startup the API seeds default **draft** and **published** site config (matching the original demo look). Use the web admin shell:

1. Open http://localhost:5173/admin (or **Admin** in the subscriber header).
2. **Branding** — site name, theme colors, logo (external URL or upload to server storage under `UPLOAD_DIR`).
3. **Homepage** — layout template (`hero-rows` or `grid-first`) and TMDB category rows.
4. **Preview** — see draft branding and homepage rows before publish.
5. Click **Publish** in the admin header; the live site at `/` updates without redeploying the web bundle.

Site API routes:

- `GET /api/v1/site/config` — published config (subscriber)
- `GET /api/v1/admin/site/config` — draft + published
- `PATCH /api/v1/admin/site/config/draft` — update draft
- `POST /api/v1/admin/site/config/publish` — promote draft to published
- `POST /api/v1/admin/site/config/reset-default` — restore draft and published to factory defaults
- `POST /api/v1/admin/site/logo` — multipart logo upload (updates draft)
- `GET /api/v1/admin/site/preview-home` — catalog home using draft blocks

**TMDB:** Set your own `TMDB_API_KEY` per deployment. You must follow [TMDB attribution and terms](https://www.themoviedb.org/api-terms-of-use); commercial use may require a TMDB commercial agreement.

### Admin API examples (curl)

List connectors:

```bash
curl -s http://localhost:3001/v1/admin/connectors
```

Create a manual connector with a static HLS URL:

```bash
curl -s -X POST http://localhost:3001/v1/admin/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "label": "My Test Server",
    "kind": "manual",
    "priority": 30,
    "config": {
      "kind": "manual",
      "sources": [{
        "id": "test-1",
        "label": "Test HLS",
        "kind": "hls",
        "url": "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8"
      }]
    }
  }'
```

Test a connector:

```bash
curl -s -X POST http://localhost:3001/v1/admin/connectors/demo-default/test \
  -H "Content-Type: application/json" \
  -d '{"mediaRef":{"provider":"tmdb","type":"movie","id":"550"}}'
```

Resolve playback:

```bash
curl -s -X POST http://localhost:3001/v1/play/resolve \
  -H "Content-Type: application/json" \
  -d '{"mediaRef":{"provider":"tmdb","type":"movie","id":"550"}}'
```

## Phase 0 scope

Included: monorepo, shared Zod contracts, health API, web shell, Compose dev stack.

Phase 1 adds: TMDB catalog API, browse/search/detail UI, Shaka demo playback.

Phase 2 adds: connector persistence, resolve orchestration, admin connector API, source picker.

Phase 3 adds: site config draft/publish, admin shell, runtime theme, layout presets, configurable homepage rows.

Not included: Deploy Pack, vendor `/prototype` routes (Phase 4–5).

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full roadmap.
