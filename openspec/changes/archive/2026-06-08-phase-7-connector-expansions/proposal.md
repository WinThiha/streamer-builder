## Why

Phases 0–4 deliver core streaming and deployment; Phase 3 deferred admin theme polish and connector UX tuning. Phase 7 captures low-risk optional expansions that improve operator experience without blocking vendor sales or hardening work.

## What Changes

- Add shadcn theme bridge so admin UI follows published brand colors.
- Add connector resolve mode: `show-all` (default) vs `first-good` (stop after first successful connector).
- Add playback-only manifest connector (static JSON URL lookup).
- Document deferred modules: custom domain wizard automation, source health/scoring, upload/transcode, full catalog manifest.

**Out of scope (deferred):** Upload/transcode worker, full catalog provider replacement, custom DNS automation, source health scoring.

## Capabilities

### New Capabilities

- `connector-resolve-mode`: Site-level `show-all` vs `first-good` orchestrator behavior.
- `shadcn-theme-bridge`: Map `SiteTheme` hex tokens to shadcn CSS variables in admin shell.
- `manifest-connector`: Static JSON manifest playback lookup connector kind.

### Modified Capabilities

- `shared-connector-contract`: `manifest` connector kind and config schema.
- `play-resolve`: First-good short-circuit behavior.
- `site-config-contract`: `connectorResolveMode` field.

## Impact

- **Shared:** Connector and site config schemas.
- **API:** Manifest driver, orchestrator mode.
- **Web:** `theme.ts`, `AdminShell.tsx`, optional manifest admin form.
