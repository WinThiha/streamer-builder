## ADDED Requirements

### Requirement: Production Dockerfiles for API and web

The repository SHALL provide production Dockerfiles at `apps/api/Dockerfile` and `apps/web/Dockerfile` that build deployable images: API runs compiled Node output with migrations SQL included; web produces a static `dist` served by Caddy or a minimal static container stage.

#### Scenario: API production image builds

- **WHEN** a developer builds the API production image from `apps/api/Dockerfile`
- **THEN** the resulting image starts the API with `node dist/index.js` and includes Drizzle SQL migration files

#### Scenario: Web production image builds static assets

- **WHEN** a developer builds the web production image from `apps/web/Dockerfile`
- **THEN** the resulting image contains a production Vite build suitable for static serving with empty or relative API base URL

### Requirement: Customer docker-compose template

The Deploy Pack SHALL include `docker-compose.yml` under `docker/production/` (or pack root) defining services: `caddy`, `api`, `postgres`, with healthchecks, restart policies, internal networking, and named volumes for Postgres data, API uploads, and Caddy TLS/data.

#### Scenario: Compose starts all production services

- **WHEN** an operator runs `docker compose up -d` in the pack directory with a valid `.env`
- **THEN** Caddy, API, and Postgres containers start and pass their defined healthchecks

### Requirement: Prebuilt image parameters with build override

The customer `docker-compose.yml` SHALL default to registry image references parameterized by `.env` (`API_IMAGE`, `WEB_IMAGE`, `IMAGE_TAG`). A companion `docker-compose.build.yml` SHALL override services to build from local Dockerfiles for development and release testing.

#### Scenario: Prebuilt images used by default

- **WHEN** an operator sets `API_IMAGE`, `WEB_IMAGE`, and `IMAGE_TAG` in `.env` and runs compose without the build override
- **THEN** compose pulls and runs the specified image tags

#### Scenario: Local build override

- **WHEN** an operator runs compose with the build override file
- **THEN** API and web images are built from repository Dockerfiles instead of pulled from a registry

### Requirement: Caddy reverse proxy configuration

The Deploy Pack SHALL include a `Caddyfile` that terminates TLS for `${DOMAIN}`, serves the web static root with SPA fallback, and reverse-proxies `/api/*` to the API service on port 3001 preserving the `/api` path prefix expected by the web client.

#### Scenario: SPA routes served

- **WHEN** a browser requests a subscriber or admin client route such as `/movie/550` or `/admin/branding`
- **THEN** Caddy returns `index.html` from the static web root

#### Scenario: API proxied under /api

- **WHEN** a browser requests `GET /api/health` through Caddy
- **THEN** the request is forwarded to the API container and returns a successful health response when the API is healthy

### Requirement: Production environment template

The Deploy Pack SHALL ship `.env.example` documenting required production variables including at minimum: `DOMAIN`, `ACME_EMAIL`, `DATABASE_URL` or Postgres credentials, `SESSION_SECRET` (or equivalent), image parameters, and optional dev-only flags. Secrets SHALL NOT be committed with real values.

#### Scenario: Operator copies env template

- **WHEN** an operator copies `.env.example` to `.env` and fills required fields
- **THEN** `install.sh` and compose can start the stack without undocumented variables

### Requirement: Persistent upload volume

The production compose template SHALL mount a persistent volume for API `UPLOAD_DIR` so uploaded logos survive container restarts.

#### Scenario: Logo persists across API restart

- **WHEN** an admin uploads a logo and the API container is recreated
- **THEN** the previously uploaded logo remains accessible via the public asset route
