## Why

Phase 0 delivered a runnable monorepo with shared connector types and placeholder apps, but the product still does not feel like a streaming site. Phase 1 is the first user-visible milestone: browse TMDB metadata locally, open a title, and play one legal demo HLS stream. This validates the core browse-to-play loop before connector resolution, theming, or deploy packaging in later phases.

## What Changes

- Add server-side TMDB integration in `apps/api` with `TMDB_API_KEY` env validation and catalog routes (home rows, search, movie/TV detail).
- Return app-owned catalog/detail DTOs instead of raw TMDB payloads to the web client.
- Replace the placeholder home page with browse rows (posters, titles) using TanStack Query.
- Add search and title detail pages with routes for movies and TV (season/episode selection for TV).
- Create `MediaRef` values from selected titles using existing shared types (`provider: "tmdb"`, movie or tv + season/episode).
- Add a play page with Shaka Player loading one hardcoded legal demo HLS stream (same stream regardless of title).
- Add reusable UI components: media cards, rows, loading/error states.
- Update README and architecture docs to reflect Phase 1 scope.

**Out of scope:** `POST /api/v1/play/resolve`, connector CRUD, source picker, per-tenant themes, customer admin, Deploy Pack, production Docker pack, database-backed catalog caching.

## Capabilities

### New Capabilities

- `tmdb-catalog-api`: Server-side TMDB client, env validation, and Hono routes for home rows, search, and movie/TV detail with normalized DTOs.
- `catalog-browsing`: Web home page with TMDB browse rows, media cards, and navigation to detail pages.
- `catalog-detail-search`: Web search page and title detail pages (movie and TV with basic season/episode selection) that produce `MediaRef` for playback.
- `demo-playback`: Shaka Player integration on a play page with one hardcoded legal demo HLS source driven by `MediaRef` context.

### Modified Capabilities

- `api-foundation`: Extend environment validation to require `TMDB_API_KEY`; add catalog route group beyond `/health`.
- `web-foundation`: Replace placeholder home content with catalog UI; extend routing beyond two placeholder pages to include search, detail, and play routes.

## Impact

- **API:** New modules under `apps/api/src/` (TMDB client, catalog routes, DTOs); `env.ts` gains `TMDB_API_KEY`.
- **Web:** New pages, components, and API helpers; Shaka Player dependency in `apps/web`.
- **Shared:** Consumes existing `MediaRef` types; no schema changes expected.
- **Docs:** `README.md`, `docs/architecture.md` updated for Phase 1 setup (TMDB key required).
- **Dependencies:** Shaka Player in web; TMDB API (external, server-side only).
- **Downstream:** Phase 2 replaces hardcoded demo stream with connector resolve orchestration.
