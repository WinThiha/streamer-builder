## 1. Shared contracts

- [x] 1.1 Add prototype preset registry and wizard payload schemas to `packages/shared`
- [x] 1.2 Export preset types from shared index

## 2. API prototype mode

- [x] 2.1 Add `isPrototypeMode()` helper and prototype seed (setup complete, demo-only connectors)
- [x] 2.2 Block non-demo connector CRUD in prototype mode
- [x] 2.3 Add `GET /v1/vendor/presets` and `POST /v1/vendor/pack` routes

## 3. Pack generator

- [x] 3.1 Implement zip assembly from `docker/production/` templates
- [x] 3.2 Generate secrets, domain, and `site.config.yaml` from wizard payload

## 4. Web prototype mode

- [x] 4.1 Add `VITE_APP_MODE` and mode-aware `SetupGate`
- [x] 4.2 Add prototype gallery, `/prototype/:preset` routes, preset config provider
- [x] 4.3 Add `/configure` wizard with live preview
- [x] 4.4 Wire pack download from wizard
