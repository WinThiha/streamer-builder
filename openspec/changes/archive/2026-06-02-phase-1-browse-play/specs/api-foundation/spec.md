## MODIFIED Requirements

### Requirement: Environment validation at startup

The API application SHALL validate required environment variables at startup using a schema (e.g. Zod) and SHALL fail fast with a clear error if validation fails. Required variables SHALL include `DATABASE_URL`, `APP_MODE`, and `TMDB_API_KEY`.

#### Scenario: Missing DATABASE_URL fails startup

- **WHEN** the API starts without `DATABASE_URL` set
- **THEN** the process exits with a descriptive validation error

#### Scenario: Missing TMDB_API_KEY fails startup

- **WHEN** the API starts without `TMDB_API_KEY` set
- **THEN** the process exits with a descriptive validation error

## ADDED Requirements

### Requirement: Catalog and play route groups mounted

The API application SHALL mount versioned route groups under `/api/v1/catalog/*` and `/api/v1/play/*` in addition to the existing health endpoint.

#### Scenario: Catalog routes reachable

- **WHEN** the API is running with valid configuration
- **THEN** `GET /api/v1/catalog/home` responds without requiring a separate server process

#### Scenario: Play demo route reachable

- **WHEN** the API is running with valid configuration
- **THEN** `GET /api/v1/play/demo` responds with a demo playback source
