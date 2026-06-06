## MODIFIED Requirements

### Requirement: TMDB API key validated at startup

The API application SHALL NOT require `TMDB_API_KEY` in environment validation at startup when deployment setup is incomplete. After setup is complete, catalog requests SHALL use the persisted TMDB key from deployment settings, with environment variable as fallback when no persisted value exists.

#### Scenario: Startup without TMDB env on fresh deployment

- **WHEN** the API starts without `TMDB_API_KEY` in environment and setup is incomplete
- **THEN** the process remains running

#### Scenario: Catalog uses persisted key after setup

- **WHEN** setup is complete with a persisted TMDB key and a client requests catalog home
- **THEN** TMDB requests use the persisted key server-side

### Requirement: TMDB key is deployment-scoped

The API application SHALL use the deployment's persisted TMDB API key (or environment fallback) for all TMDB catalog requests. The product SHALL NOT embed a vendor TMDB key in customer deliverables.

#### Scenario: Customer key used from setup

- **WHEN** a customer completes setup with their TMDB API key
- **THEN** catalog home and search use that key server-side only

## ADDED Requirements

### Requirement: Catalog unavailable before TMDB configured

When setup is incomplete or no TMDB key is configured, catalog endpoints SHALL return HTTP 503 with a generic operator-facing message and SHALL NOT expose whether a key exists in responses.

#### Scenario: Home catalog before TMDB configured

- **WHEN** a client requests `GET /api/v1/catalog/home` before TMDB is configured
- **THEN** the response status is 503 with a generic unavailable message
