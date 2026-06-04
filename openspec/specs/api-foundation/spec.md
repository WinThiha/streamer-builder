# api-foundation Specification

## Purpose

Hono API shell with health check, environment validation, and PostgreSQL connectivity via Drizzle.
## Requirements
### Requirement: Health endpoint

The API application SHALL expose `GET /health` that returns HTTP 200 with a JSON body indicating the service is up.

#### Scenario: Health check succeeds

- **WHEN** a client requests `GET /health` on the running API
- **THEN** the response status is 200 and the body indicates healthy status

### Requirement: Environment validation at startup

The API application SHALL validate required environment variables at startup using a schema (e.g. Zod) and SHALL fail fast with a clear error if validation fails. Required variables SHALL include `DATABASE_URL`, `APP_MODE`, and `TMDB_API_KEY`.

#### Scenario: Missing DATABASE_URL fails startup

- **WHEN** the API starts without `DATABASE_URL` set
- **THEN** the process exits with a descriptive validation error

#### Scenario: Missing TMDB_API_KEY fails startup

- **WHEN** the API starts without `TMDB_API_KEY` set
- **THEN** the process exits with a descriptive validation error

### Requirement: Database connection placeholder

The API application SHALL initialize a Drizzle client connected to PostgreSQL using `DATABASE_URL`, SHALL verify connectivity via the health check, and SHALL use the database for application tables including `connectors` and `site_config`.

#### Scenario: API starts with database available

- **WHEN** the API starts with valid `DATABASE_URL` and PostgreSQL is running with migrations applied
- **THEN** the API process remains running, `/health` responds successfully, and connector and site config queries succeed

### Requirement: Catalog and play route groups mounted

The API application SHALL mount versioned route groups under `/api/v1/catalog/*`, `/api/v1/play/*`, `/api/v1/admin/connectors/*`, `/api/v1/site/*`, and `/api/v1/admin/site/*` in addition to the health endpoint.

#### Scenario: Catalog routes reachable

- **WHEN** the API is running with valid configuration
- **THEN** `GET /api/v1/catalog/home` responds without requiring a separate server process

#### Scenario: Play resolve route reachable

- **WHEN** the API is running with valid configuration and at least one enabled connector
- **THEN** `POST /api/v1/play/resolve` accepts a valid body and returns a resolve response

#### Scenario: Play demo route reachable

- **WHEN** the API is running with valid configuration
- **THEN** `GET /api/v1/play/demo` responds with a demo playback source

#### Scenario: Admin connector routes reachable

- **WHEN** the API is running with valid configuration
- **THEN** `GET /api/v1/admin/connectors` responds with the connector list

#### Scenario: Public site config reachable

- **WHEN** the API is running with valid configuration and site config seeded
- **THEN** `GET /api/v1/site/config` responds with published site configuration

#### Scenario: Admin site config reachable

- **WHEN** the API is running with valid configuration
- **THEN** `GET /api/v1/admin/site/config` responds with draft and published site configuration

