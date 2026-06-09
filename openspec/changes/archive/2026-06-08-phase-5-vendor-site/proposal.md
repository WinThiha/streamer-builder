## Why

Phase 4 delivers customer Deploy Pack templates and first-run setup, but there is no vendor-facing sales flow. Phase 5 closes that gap: visitors try legal prototype presets on the vendor domain, configure branding in a web wizard, preview the result, and download a Deploy Pack — without hosting customer streams on vendor infrastructure.

## What Changes

- Add `APP_MODE=prototype` behavior: bypass customer setup gate, restrict connectors to demo/legal sources, hide production admin on vendor host.
- Add prototype preset registry and `/prototype/:preset` subscriber route tree with shared TMDB catalog.
- Add vendor landing gallery linking presets and `/configure` multi-step wizard (brand, layout, homepage, domain).
- Add wizard live preview using client-held draft config (not customer admin DB draft).
- Add server-side Deploy Pack zip generator from `docker/production/` templates + wizard payload.
- Optional: shareable `/preview/:sessionId` preview sessions with TTL.

**Out of scope:** Piracy/unlicensed embeds on vendor domain, hosting customer video, custom DNS automation (Phase 7).

## Capabilities

### New Capabilities

- `prototype-mode-behavior`: `APP_MODE=prototype` routing, setup bypass, connector restrictions, vendor TMDB from env.
- `prototype-presets`: Preset slug registry, gallery, `/prototype/:preset` routes.
- `configure-wizard-ui`: `/configure` wizard, client draft state, live preview.
- `deploy-pack-generation`: API zip assembly from production templates, secrets, `site.config.yaml`.

### Modified Capabilities

- `web-foundation`: Prototype routes, mode-aware setup gate, `VITE_APP_MODE`.
- `api-foundation`: Vendor routes, prototype seeding, pack generation endpoint.
- `first-run-setup`: Clarify vendor prototype bypasses customer setup flow.
- `deploy-pack-packaging`: Pack generation from wizard (extends Phase 4 templates).

## Impact

- **Shared:** `packages/shared` — preset registry, wizard payload schema.
- **API:** `apps/api/src/env.ts`, vendor routes, pack generator, prototype seed.
- **Web:** `App.tsx`, `RouteGuards.tsx`, gallery, configure wizard, preview.
- **Packaging:** `docker/production/` used as zip template source.
