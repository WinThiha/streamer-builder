## MODIFIED Requirements

### Requirement: Database connection placeholder

The API application SHALL initialize a Drizzle client connected to PostgreSQL using `DATABASE_URL`, SHALL verify connectivity via the health check, and SHALL use the database for application tables (starting with `connectors` in Phase 2).

#### Scenario: API starts with database available

- **WHEN** the API starts with valid `DATABASE_URL` and PostgreSQL is running with migrations applied
- **THEN** the API process remains running, `/health` responds successfully, and connector queries succeed

### Requirement: Catalog and play route groups mounted

The API application SHALL mount versioned route groups under `/api/v1/catalog/*`, `/api/v1/play/*`, and `/api/v1/admin/connectors/*` in addition to the health endpoint.

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
