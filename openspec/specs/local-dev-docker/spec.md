# local-dev-docker Specification

## Purpose

Docker Compose dev stack with PostgreSQL, API, and web services plus documented environment template.
## Requirements
### Requirement: Docker Compose dev stack

The repository SHALL provide `docker-compose.dev.yml` that starts PostgreSQL 16, the API service, and the web dev service together.

#### Scenario: Compose brings up services

- **WHEN** a developer runs `docker compose -f docker-compose.dev.yml up`
- **THEN** postgres, api, and web containers start and remain running

### Requirement: Documented environment template

The repository SHALL include `.env.example` listing `DATABASE_URL`, `APP_MODE`, `TMDB_API_KEY`, `JWT_SECRET`, API port, web port, and public API URL variables with brief comments.

#### Scenario: Copy env template

- **WHEN** a developer copies `.env.example` to `.env` and fills required values for local Docker
- **THEN** documented variables are sufficient to start the dev stack per README

### Requirement: Web proxies API in dev

In Docker dev, the web service configuration SHALL proxy `/api` requests to the API service so the browser can call same-origin `/api` paths.

#### Scenario: Proxy to API

- **WHEN** the web container receives a request to `/api/health` (or equivalent proxied path)
- **THEN** the request is forwarded to the API service and returns the API health response

### Requirement: Production docker placeholder

The repository SHALL include a `docker/production/` directory with a README describing the future Caddy + static + API layout without implementing production deploy in Phase 0.

#### Scenario: Placeholder documented

- **WHEN** a developer reads `docker/production/README.md`
- **THEN** they understand production topology is deferred to Phase 4
