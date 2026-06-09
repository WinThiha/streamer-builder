## Context

Resolve orchestrator merges all connector results in parallel with fixed 15m cache TTL. HTTP connectors fetch arbitrary URLs. Migrations re-run all SQL on every boot without ledger.

## Goals / Non-Goals

**Goals:** SSRF protection, embed allowlist, expiresAt cache, admin diagnostics, migration ledger, restore script.

**Non-Goals:** Signed URL proxy, Redis, catalog availability UX.

## Decisions

### 1. URL safety in shared package

**Decision:** `packages/shared/src/url-safety.ts` blocks localhost, private IPs, link-local, metadata endpoints. Production blocks all; dev allows localhost via `NODE_ENV=development`.

### 2. embedAllowlist on SiteConfig

**Decision:** Optional `playback.embedAllowlist: string[]` hostnames. Empty = allow all (backward compatible). Enforced after embed URL interpolation.

### 3. Cache TTL = min(15m, nearest expiresAt - buffer)

**Decision:** 60s buffer before source expiry; if any source expires sooner, use that for cache entry TTL.

### 4. Migration ledger

**Decision:** `schema_migrations` table; runner applies only unapplied files sorted by name.

### 5. Admin resolve diagnostics

**Decision:** `POST /v1/admin/play/resolve` returns `{ sources, connectorResults: [{ connectorId, ok, error?, sourceCount }] }`. Subscriber route unchanged.

## Risks

- Orchestrator is merge hotspot; refactor internals once for diagnostics + first-good mode.
