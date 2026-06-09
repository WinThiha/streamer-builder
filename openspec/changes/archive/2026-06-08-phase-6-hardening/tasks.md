## 1. Shared URL safety

- [x] 1.1 Add `url-safety.ts` to `packages/shared` with tests
- [x] 1.2 Export from shared index

## 2. SSRF and embed allowlist

- [x] 2.1 Validate HTTP connector URLs on save and before fetch
- [x] 2.2 Add `playback.embedAllowlist` to site config schema and enforce in embed driver

## 3. Resolve improvements

- [x] 3.1 Honor `expiresAt` in cache TTL
- [x] 3.2 Add admin resolve diagnostics endpoint

## 4. Migrations and ops

- [x] 4.1 Add `schema_migrations` table and ledger-aware runner
- [x] 4.2 Add `restore.sh` and update QUICKSTART backup/update guidance
