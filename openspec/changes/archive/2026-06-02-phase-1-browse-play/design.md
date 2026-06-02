## Context

Phase 0 established a runnable monorepo: Hono API with `/health`, Vite + React shell with placeholder routes, shared `MediaRef`/`Source` Zod schemas, and Docker dev stack. The web home page currently shows an API health check only. Phase 1 must deliver the first end-to-end user journey from [docs/ROADMAP.md](../../../docs/ROADMAP.md): browse TMDB metadata, open a title, press Play, and watch one legal demo HLS stream.

TMDB API keys must never reach the browser. The web app calls local API routes only; the API proxies and normalizes TMDB responses into app-owned DTOs. Playback is intentionally fake in Phase 1: every title plays the same hardcoded legal HLS URL. Phase 2 will replace this with connector resolve orchestration.

## Goals / Non-Goals

**Goals:**

- Server-side TMDB client with `TMDB_API_KEY` validated at API startup.
- Catalog API routes: home rows, search, movie detail, TV detail (with seasons/episodes).
- Normalized DTOs for browse cards and detail pages (not raw TMDB payloads).
- Web browse UI: home rows, search, detail pages with Play action.
- `MediaRef` creation from selected titles using shared types (`provider: "tmdb"`).
- Shaka Player on a play page loading one hardcoded legal demo HLS stream.
- Loading and error states for catalog and playback.

**Non-Goals:**

- `POST /api/v1/play/resolve` or connector orchestration (Phase 2).
- Source picker, multiple streams, or per-title stream URLs.
- Database-backed catalog caching or user watch history.
- Per-tenant theming, admin UI, Deploy Pack, production Docker.
- Subtitles, DRM, adaptive quality UI, or embed playback.
- Netflix-polish UI (hero autoplay, infinite scroll, recommendations engine).

## Decisions

### TMDB key stays server-side

**Choice:** Add `TMDB_API_KEY` to API env validation; web never receives or stores the key.

**Rationale:** Security and roadmap alignment. Customers configure their own TMDB key in later phases; the pattern starts here.

**Alternatives:** Client-side TMDB calls (rejected — exposes key).

### App-owned catalog DTOs

**Choice:** API maps TMDB responses to normalized types (e.g. `CatalogItem`, `CatalogRow`, `TitleDetail`) before returning JSON.

**Rationale:** Decouples web from TMDB schema changes; allows future non-TMDB providers without web rewrites.

**Alternatives:** Pass-through TMDB JSON (simpler short-term, brittle long-term).

### Catalog route shape

**Choice:**

| Route | Purpose |
|-------|---------|
| `GET /api/v1/catalog/home` | Multiple named rows (trending, popular movies, popular TV) |
| `GET /api/v1/catalog/search?q=` | Multi-type search results |
| `GET /api/v1/catalog/movie/:id` | Movie detail |
| `GET /api/v1/catalog/tv/:id` | TV detail with seasons |
| `GET /api/v1/catalog/tv/:id/season/:season` | Episodes for a season |

**Rationale:** RESTful, cache-friendly, matches browse → detail → play flow.

**Alternatives:** GraphQL (overkill for Phase 1); single `/catalog/:type/:id` with query params (acceptable but less explicit).

### Demo playback without resolve endpoint

**Choice:** Play page reads `mediaRef` from route state or query params for display context; stream URL is a constant in web config (or a simple `GET /api/v1/play/demo` returning one `Source`-shaped object).

**Rationale:** Exercises `MediaRef` without building Phase 2 resolver. Optional demo endpoint keeps URL server-configurable for Phase 5 legal allowlist.

**Alternatives:** Hardcode URL only in web (simpler); full resolve endpoint (Phase 2 scope creep).

### Demo HLS source

**Choice:** Use a well-known public legal HLS test stream (e.g. Apple HLS sample or Mux test stream). Document the URL in design/tasks; make it env-configurable via `DEMO_HLS_URL` on API if returned from demo endpoint.

**Rationale:** Must be legal for vendor demo and local dev; no pirated content.

### Shaka Player in web

**Choice:** Install `shaka-player` in `apps/web`; wrap in a React component with mount/unmount lifecycle and basic error display.

**Rationale:** Recorded in [docs/architecture.md](../../../docs/architecture.md) as Phase 1 direction; supports HLS and future DASH.

**Alternatives:** video.js + hls.js (roadmap alternative; defer unless Shaka issues arise).

### TV episode UX (minimal)

**Choice:** TV detail shows seasons; user selects season (default S1) and episode (default E1). Play button creates `MediaRef` with `type: "tv"`, `season`, `episode`. Player still loads demo stream.

**Rationale:** Validates `MediaRef` shape for TV without requiring real per-episode sources.

### Web routing

**Choice:**

| Route | Page |
|-------|------|
| `/` | Home browse rows |
| `/search` | Search with query param `?q=` |
| `/movie/:id` | Movie detail |
| `/tv/:id` | TV detail (season/episode picker) |
| `/play` | Player (accepts `mediaRef` via location state or serialized query) |

**Rationale:** Clean URLs for movies/TV; play route shared for all types.

### No new DB tables in Phase 1

**Choice:** Catalog data is fetched live from TMDB per request; no Drizzle migrations for catalog cache.

**Rationale:** Roadmap Phase 1 is local-only proof; caching arrives in Phase 6.

## Architecture

```
┌──────────────┐     /api/v1/catalog/*     ┌──────────────┐     TMDB v3     ┌──────────┐
│  apps/web    │ ────────────────────────▶ │  apps/api    │ ──────────────▶ │  TMDB    │
│  TanStack Q  │                           │  tmdb client │                 └──────────┘
│  Shaka       │     /api/v1/play/demo     │  DTO mappers │
└──────────────┘ ◀──────────────────────── └──────────────┘
       │
       ▼
  demo HLS URL (constant or from API)
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| TMDB rate limits during dev | No cache in Phase 1; document key setup; avoid aggressive polling |
| TMDB image URLs require base path | Include `posterUrl`/`backdropUrl` as full URLs in DTOs |
| Shaka + React StrictMode double-mount | Clean up player instance in `useEffect` return |
| CORS on demo HLS stream | Choose a stream with permissive CORS; document fallback |
| Missing TMDB key blocks catalog | Fail at API startup with clear error; health may still work |
| TV detail requires multiple TMDB calls | Acceptable for Phase 1; batch in client with loading states |

## Migration Plan

N/A — additive change on Phase 0 foundation. Developers add `TMDB_API_KEY` to `.env`, run existing dev stack, and use new routes/pages. Placeholder home health section can be removed or moved to About.

## Open Questions

- Final demo HLS URL selection (pick during implementation; must be legal and CORS-friendly).
- Whether to expose demo stream via `GET /api/v1/play/demo` or hardcode in web only (recommend API endpoint for Phase 5 reuse).
