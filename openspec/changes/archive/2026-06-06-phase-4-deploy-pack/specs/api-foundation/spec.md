## MODIFIED Requirements

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

## ADDED Requirements

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
