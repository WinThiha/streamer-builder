## Why

Phase 4 enables customer VPS deployment, but production safety gaps remain: HTTP connectors can target internal networks (SSRF), embed sources lack hostname allowlists, resolve cache ignores `expiresAt`, migrations lack versioning, and operators lack restore tooling. Phase 6 hardens the platform for long-running production use.

## What Changes

- Add shared URL safety utilities and SSRF protection for HTTP connector resolver URLs.
- Add per-site `embedAllowlist` and enforce allowed hostnames for embed sources.
- Make resolve cache TTL honor `Source.expiresAt` (shorter of default TTL and nearest source expiry).
- Add admin-only resolve diagnostics endpoint exposing per-connector outcomes.
- Add migration ledger table so non-idempotent SQL migrations run once.
- Add `restore.sh`, backup-before-update guidance, and operator doc improvements.

**Out of scope:** Signed URL stream proxy, Redis cache, catalog availability prefetch (product decision deferred).

## Capabilities

### New Capabilities

- `url-safety`: Shared URL validation, private IP/metadata blocking, policy for dev vs production.
- `embed-allowlist`: Site config `embedAllowlist` and enforcement in embed driver.
- `resolve-cache-expires`: Cache TTL derived from source `expiresAt`.
- `admin-resolve-diagnostics`: Admin-only full resolve with connector results.
- `migration-ledger`: Tracked applied migrations on API boot.

### Modified Capabilities

- `play-resolve`: Cache TTL behavior, admin diagnostics route.
- `connector-admin-api`: SSRF validation on HTTP connector save.
- `site-config-contract`: `embedAllowlist` field.
- `operator-scripts`: `restore.sh`, update backup guidance.

## Impact

- **Shared:** URL safety module, extended resolve/site schemas.
- **API:** `resolve/`, `routes/admin/`, `db/migrate.ts`, HTTP/embed drivers.
- **Web:** Optional admin diagnostics UI on Sources page.
- **Ops:** `docker/production/scripts/`.
