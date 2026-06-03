## 1. Shared connector contract

- [x] 1.1 Add `connectorConfigSchema` discriminated union (`demo`, `manual`, `http`) in `packages/shared`
- [x] 1.2 Extend `resolveRequestSchema` with optional `metadata`; export types from `packages/shared/src/index.ts`
- [x] 1.3 Rebuild shared package and fix any API/web import breakages

## 2. Database and connector persistence

- [x] 2.1 Add drizzle-kit config and migration scripts to `apps/api` (`db:migrate`, `db:generate`)
- [x] 2.2 Define `connectors` Drizzle schema (`id`, `label`, `kind`, `enabled`, `priority`, `config`, timestamps)
- [x] 2.3 Implement connector repository (list all, list enabled, get by id, create, update, delete)
- [x] 2.4 Add seed for default `demo` connector and sample `manual` connector (two distinct labels for picker testing)
- [x] 2.5 Document migration/seed commands in README

## 3. Resolve orchestrator and drivers

- [x] 3.1 Implement demo driver (env `DEMO_HLS_URL`, shared `Source` shape)
- [x] 3.2 Implement manual driver (static `sources[]` from config)
- [x] 3.3 Implement http driver (`POST` to `resolveUrl`, validate response `sources[]`, timeout)
- [x] 3.4 Implement orchestrator: parallel resolve, validate, merge, dedupe by URL, sort, cap
- [x] 3.5 Add in-memory resolve cache with TTL and cache key including connector `updatedAt`
- [x] 3.6 Invalidate or bump cache key on connector admin writes

## 4. Play API routes

- [x] 4.1 Implement `POST /api/v1/play/resolve` using shared schemas and orchestrator
- [x] 4.2 Keep `GET /api/v1/play/demo` compatible with Phase 1 behavior
- [x] 4.3 Mount play routes and return subscriber-safe empty `sources` on total failure

## 5. Admin connector API

- [x] 5.1 Implement `GET /api/v1/admin/connectors`
- [x] 5.2 Implement `POST /api/v1/admin/connectors` with kind-specific config validation
- [x] 5.3 Implement `PATCH /api/v1/admin/connectors/:id` and `DELETE /api/v1/admin/connectors/:id`
- [x] 5.4 Implement `POST /api/v1/admin/connectors/:id/test` with diagnostics
- [x] 5.5 Mount admin routes in `apps/api/src/index.ts`

## 6. Web resolve and source picker

- [x] 6.1 Add `fetchPlayResolve(mediaRef)` in `apps/web/src/lib/api.ts` (POST resolve)
- [x] 6.2 Create `SourcePicker` component (list sources, selection state)
- [x] 6.3 Update `PlayPage` to resolve on load, show picker, pass selected URL to `ShakaPlayerView`
- [x] 6.4 Handle empty sources, resolve HTTP errors, and embed kind unsupported message
- [x] 6.5 Remove Phase 1 “same demo for all titles” copy; keep MediaRef context display

## 7. Contract documentation

- [x] 7.1 Create `docs/connector-contract-v1.md` (request/response, connector kinds, errors, cache, security notes)
- [x] 7.2 Align JSON examples with `packages/shared` schemas
- [x] 7.3 Update `docs/architecture.md` and README for Phase 2 resolve/admin/migrations
- [x] 7.4 Add admin API curl examples to README (create manual connector, test, resolve)

## 8. Verification

- [x] 8.1 Run `pnpm typecheck` and `pnpm lint`
- [x] 8.2 Manual: migrate + seed → two sources on play → switch streams in picker
- [x] 8.3 Manual: admin Test returns diagnostics for demo and manual connectors
- [x] 8.4 Manual: disable one connector → resolve returns fewer sources
