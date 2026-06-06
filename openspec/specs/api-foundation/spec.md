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

The API application SHALL validate required environment variables at startup using a schema (e.g. Zod) and SHALL fail fast with a clear error if validation fails. Required variables SHALL include `DATABASE_URL` and `APP_MODE`. In production (`NODE_ENV=production`), `SESSION_SECRET` (or equivalent) SHALL also be required. `TMDB_API_KEY` SHALL NOT be required at startup when setup is incomplete; it MAY be supplied via environment as a fallback when persisted settings are absent.

#### Scenario: Missing DATABASE_URL fails startup

- **WHEN** the API starts without `DATABASE_URL` set
- **THEN** the process exits with a descriptive validation error

#### Scenario: Missing TMDB env does not fail startup before setup

- **WHEN** the API starts without `TMDB_API_KEY` in environment on a deployment where setup is incomplete
- **THEN** the process remains running and setup endpoints are reachable

#### Scenario: Missing session secret fails production startup

- **WHEN** the API starts in production without a configured session secret
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

### Requirement: Setup and auth route groups mounted

The API application SHALL mount `/api/v1/setup/*` and `/api/v1/admin/auth/*` route groups in addition to existing versioned routes.

#### Scenario: Setup status reachable

- **WHEN** the API is running on a fresh deployment
- **THEN** `GET /api/v1/setup/status` responds without requiring TMDB configuration

#### Scenario: Admin login reachable after setup

- **WHEN** setup is complete and the API is running in production
- **THEN** `POST /api/v1/admin/auth/login` accepts credential submission

### Requirement: Health reflects database and setup state

The API health endpoint SHALL continue to report database connectivity and MAY include setup completion status for operator diagnostics.

#### Scenario: Health reports database connected

- **WHEN** PostgreSQL is available
- **THEN** `GET /health` reports database as connected

#### Scenario: Health succeeds before setup complete

- **WHEN** setup is incomplete but database is connected
- **THEN** `GET /health` returns HTTP 200 with status indicating the API is operational

