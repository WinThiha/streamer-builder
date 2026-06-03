## Context

Phase 1 delivers browse → detail → play with `MediaRef` in router state and a single legal demo HLS stream from `GET /api/v1/play/demo`. Shared types in `packages/shared` already define `MediaRef`, `Source`, and resolve request/response shapes, but no orchestrator or connector storage exists. PostgreSQL is wired via Drizzle with no application tables yet.

Phase 2 implements [docs/ROADMAP.md](../../../docs/ROADMAP.md) connector contract v1: multiple sources per title, admin connector CRUD/Test, and a Cineby-like source picker—still single-tenant local dev.

## Goals / Non-Goals

**Goals:**

- Persist connectors in PostgreSQL (`demo`, `manual` static URLs, `http` resolver URL).
- `POST /api/v1/play/resolve` orchestrates enabled connectors in parallel, validates `sources[]`, merges/dedupes/sorts/caps, caches by `mediaRef` + connector set.
- Admin API: list/create/update/delete connectors and Test with a supplied `mediaRef`.
- Web play page resolves on load, shows source picker, plays HLS/progressive via Shaka.
- `docs/connector-contract-v1.md` documents the public contract aligned with Zod schemas.
- Local dev can show at least two sources (e.g. seeded demo + manual) without external resolver infrastructure.

**Non-Goals:**

- Admin authentication (local trust boundary).
- Per-title manual mappings (static URLs only for `manual`).
- Embed playback in UI (contract may include `embed`; UI shows unsupported message).
- TMDB metadata in HTTP resolve body on first pass (optional field reserved; send `mediaRef` only unless trivial to add).
- SSRF protection, signed stream proxy, partial-resolve admin diagnostics (Phase 6).
- Deploy Pack, theming, `/prototype`, admin UI polish (API + curl/README acceptable; simple admin page optional stretch).

## Decisions

### Connector storage in Postgres now

**Choice:** Add `connectors` table via Drizzle schema + drizzle-kit migrations; repository layer in API.

**Rationale:** Roadmap requires admin CRUD/Test; in-memory config would be throwaway before Phase 4 customer install.

**Alternatives:** JSON file config (no CRUD story); defer DB to Phase 4 (blocks realistic admin Test).

### Connector kinds

| Kind | Behavior |
|------|----------|
| `demo` | Returns one legal HLS source from env `DEMO_HLS_URL` (same as Phase 1), labeled per connector config. |
| `manual` | Returns fixed `sources[]` from admin-configured static URLs (test/demo servers). |
| `http` | `POST` to `config.resolveUrl` with JSON body `{ mediaRef }`; parse and validate `sources[]` from response. |

**Rationale:** Matches product exploration: `manual` = static test sources, `http` = customer extensibility.

### Resolve orchestrator

**Choice:** Single service module: load enabled connectors → `Promise.allSettled` per driver → validate with shared Zod → merge (concat), dedupe by `url`, sort by connector `priority` then `label`, cap (e.g. 20) → cache in memory keyed by serialized `mediaRef` + connector version/updatedAt hash, TTL ~15 minutes or min(`expiresAt`) if sooner.

**Rationale:** Roadmap default; simple for single API instance in Phase 2.

**Alternatives:** Sequential resolve (slower); Redis cache (Phase 6 / multi-instance).

### Subscriber vs admin errors

**Choice:** Resolve returns `{ sources: [] }` with HTTP 200 when all connectors fail; optional generic message field avoided in v1. Admin Test returns per-connector success/failure and validation errors.

**Rationale:** Avoid leaking resolver internals to viewers; operators need diagnostics.

### Play API surface

**Choice:**

| Route | Purpose |
|-------|---------|
| `POST /api/v1/play/resolve` | Subscriber resolve (body: `resolveRequestSchema`) |
| `GET /api/v1/play/demo` | Keep for dev compatibility; same as demo connector output |
| `/api/v1/admin/connectors` | CRUD |
| `POST /api/v1/admin/connectors/:id/test` | Test with body `{ mediaRef }` |

**Rationale:** Matches roadmap; demo GET eases incremental web migration.

### Web source picker

**Choice:** `PlayPage` POSTs resolve on mount (React Query); render list of sources by `label`; default first source; changing selection updates Shaka `src`. Show loading/error for resolve. `embed` sources: display “Embed playback not supported in this version” without iframe.

**Rationale:** Minimal Cineby-like UX; Shaka already reloads on `src` change.

### Migrations and seed

**Choice:** drizzle-kit in `apps/api`; migration on deploy/dev documented in README; seed script or migration SQL inserts default `demo` connector and optional second `manual` connector with distinct labels.

**Rationale:** Satisfies “two sources in picker” done-when without manual SQL.

### Shared schema extensions

**Choice:** Add discriminated union `connectorConfigSchema` by `kind`; extend resolve request with optional `metadata` object (opaque record) for future TMDB enrichment without requiring it.

**Rationale:** Contract doc and HTTP connectors can evolve without breaking v1 clients.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| HTTP connector SSRF in dev | Document localhost-only policy; Phase 6 adds URL validation |
| In-memory cache stale after connector edit | Include connector `updatedAt` in cache key or invalidate on admin write |
| No admin auth | README warns local-only; Phase 4 setup may add auth |
| Duplicate labels confuse users | Dedupe by URL; sort stable by priority |
| Migration friction for existing dev DBs | Document `pnpm db:migrate` in README and Compose startup note |

## Migration Plan

1. Add migration tooling and `connectors` table.
2. Run migrations against dev Postgres (Compose or local).
3. Seed default connectors.
4. Deploy API with resolve + admin routes; web switches to resolve.
5. Rollback: revert web to `GET /demo`; disable connectors via `enabled=false` without dropping table.

## Open Questions

- Optional minimal `/admin/connectors` web page vs API-only (default: API-only + README examples; implement page only if tasks have capacity).
- Whether to pass TMDB title metadata to HTTP connectors in Phase 2 implementation (default: `mediaRef` only).
