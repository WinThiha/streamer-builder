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

The API application SHALL validate required environment variables at startup using a schema (e.g. Zod) and SHALL fail fast with a clear error if validation fails.

#### Scenario: Missing DATABASE_URL fails startup

- **WHEN** the API starts without `DATABASE_URL` set
- **THEN** the process exits with a descriptive validation error

### Requirement: Database connection placeholder

The API application SHALL initialize a Drizzle client connected to PostgreSQL using `DATABASE_URL` and SHALL verify connectivity on startup or via health check extension in a later phase; Phase 0 MUST at minimum configure the client without crashing when the database is reachable.

#### Scenario: API starts with database available

- **WHEN** the API starts with valid `DATABASE_URL` and PostgreSQL is running
- **THEN** the API process remains running and `/health` responds successfully
