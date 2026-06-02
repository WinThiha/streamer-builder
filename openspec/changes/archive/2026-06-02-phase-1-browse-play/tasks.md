## 1. API environment and TMDB client

- [x] 1.1 Add `TMDB_API_KEY` and optional `DEMO_HLS_URL` to API env validation in `apps/api/src/env.ts`
- [x] 1.2 Create TMDB HTTP client module (`apps/api/src/tmdb/client.ts`) with bearer auth and error handling
- [x] 1.3 Define catalog DTO types and mappers (`apps/api/src/catalog/types.ts`, `mappers.ts`) for rows, items, movie detail, TV detail, episodes
- [x] 1.4 Add TMDB image URL helper for full `posterUrl` and `backdropUrl` paths

## 2. API catalog routes

- [x] 2.1 Implement `GET /api/v1/catalog/home` with trending/popular rows
- [x] 2.2 Implement `GET /api/v1/catalog/search?q=` with validation for missing query
- [x] 2.3 Implement `GET /api/v1/catalog/movie/:id` with 404 for unknown ids
- [x] 2.4 Implement `GET /api/v1/catalog/tv/:id` with seasons list
- [x] 2.5 Implement `GET /api/v1/catalog/tv/:id/season/:season` with episodes list
- [x] 2.6 Mount catalog routes in `apps/api/src/index.ts` and handle TMDB upstream errors (502/503)

## 3. API demo playback route

- [x] 3.1 Implement `GET /api/v1/play/demo` returning a single shared `Source`-shaped HLS object
- [x] 3.2 Use `DEMO_HLS_URL` env with a documented legal default fallback

## 4. Web API client and types

- [x] 4.1 Add catalog and play API helpers in `apps/web/src/lib/api.ts` (home, search, movie, TV, season, demo)
- [x] 4.2 Define web-side TypeScript types matching API DTOs

## 5. Web catalog UI components

- [x] 5.1 Create `MediaCard` component (poster, title, link by type)
- [x] 5.2 Create `MediaRow` component (horizontal scroll row with title)
- [x] 5.3 Create shared loading and error display components for catalog pages

## 6. Web pages and routing

- [x] 6.1 Replace placeholder home in `Home.tsx` with catalog rows via TanStack Query
- [x] 6.2 Add `SearchPage` at `/search` with query input and results
- [x] 6.3 Add `MovieDetailPage` at `/movie/:id` with Play action
- [x] 6.4 Add `TvDetailPage` at `/tv/:id` with season/episode selector and Play action
- [x] 6.5 Update `App.tsx` routes and shell nav (home, search); remove or relocate Phase 0 health-only home content
- [x] 6.6 Wire Play navigation to `/play` with `MediaRef` via router location state

## 7. Shaka Player integration

- [x] 7.1 Add `shaka-player` dependency to `apps/web/package.json`
- [x] 7.2 Create `ShakaPlayer` React component with mount, load, error display, and cleanup on unmount
- [x] 7.3 Create `PlayPage` at `/play` that fetches demo source, shows MediaRef context, and renders Shaka Player

## 8. Documentation and verification

- [x] 8.1 Update `README.md` with TMDB key setup and Phase 1 browse/play instructions
- [x] 8.2 Update `docs/architecture.md` to note Shaka wired and TMDB server-side pattern
- [x] 8.3 Update `.env.example` if new env vars added (`DEMO_HLS_URL`)
- [x] 8.4 Run `pnpm typecheck` and `pnpm lint`
- [x] 8.5 Manual verify: browse home → search → movie detail → play demo stream
- [x] 8.6 Manual verify: TV detail → select season/episode → play with correct MediaRef context
