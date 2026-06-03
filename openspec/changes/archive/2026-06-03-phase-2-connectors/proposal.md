## Why

Phase 1 proves browse-to-play with one legal demo stream for every title. The product’s core value is multi-source playback: customers configure resolvers, viewers pick a server, and the platform orchestrates parallel resolve with a stable contract. Phase 2 delivers that loop locally before deploy packs, theming, or vendor prototype routes.

## What Changes

- Add Postgres-backed connector configuration (first Drizzle schema and migration workflow).
- Extend `packages/shared` with connector config schemas for `demo`, `manual` (static admin-entered test URLs), and `http` (customer resolver URL).
- Implement `POST /api/v1/play/resolve` with parallel orchestration, validation, merge/dedupe/sort/cap, and in-memory TTL cache.
- Add minimal admin API: connector CRUD and `Test` against a supplied `mediaRef`.
- Replace play-page demo-only fetch with resolve + subscriber source picker (HLS/progressive via Shaka; embed deferred or unsupported in UI).
- Add normative `docs/connector-contract-v1.md` aligned with shared Zod schemas.
- Seed or document default demo + sample manual connectors so two sources appear in the picker without external infrastructure.

**Out of scope:** Deploy Pack, white-label theming, `/prototype` routes, stream proxy, DRM, SSRF hardening (Phase 6), admin auth (local single-tenant), per-title manual mappings, connector marketplace.

**Non-breaking:** `GET /api/v1/play/demo` may remain for compatibility during development.

## Capabilities

### New Capabilities

- `connector-persistence`: Drizzle schema, migrations, and repository for enabled connectors stored in PostgreSQL.
- `play-resolve`: Resolve orchestrator, `POST /v1/play/resolve`, connector drivers (`demo`, `manual`, `http`), caching, and subscriber-safe error handling.
- `connector-admin-api`: Admin routes for connector CRUD and Test with validated diagnostics.
- `source-picker-ui`: Play page resolve integration and UI to list and switch among returned sources.

### Modified Capabilities

- `shared-connector-contract`: Add connector config types and optional resolve metadata; document v1 contract fields beyond Phase 0 placeholders.
- `demo-playback`: Play flow uses resolve + source picker; demo stream becomes one connector outcome, not the only path.
- `api-foundation`: Mount play resolve and admin connector route groups; database used for connector storage beyond health check.

## Impact

- **API:** New `connectors` table, migration tooling, orchestrator module, `play` resolve route, `admin/connectors` routes; `apps/api/src/db.ts` gains schema usage.
- **Web:** `PlayPage` posts `mediaRef` to resolve; new source picker component; optional simple admin page or API-only docs.
- **Shared:** New Zod schemas for connector configs; possible resolve request metadata field.
- **Docs:** `docs/connector-contract-v1.md` (new), `docs/architecture.md` and README updated for Phase 2.
- **Dependencies:** Drizzle migration workflow (e.g. drizzle-kit); no new runtime deps required beyond existing stack.
- **Downstream:** Phase 3 branding and Phase 4 Deploy Pack build on persisted connectors; Phase 6 adds SSRF and richer partial-resolve behavior.
