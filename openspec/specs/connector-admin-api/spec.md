# connector-admin-api Specification

## Purpose

Local admin HTTP API for connector CRUD and Test diagnostics against a supplied `MediaRef`.
## Requirements
### Requirement: List connectors

The API application SHALL expose `GET /api/v1/admin/connectors` returning all connector records including `id`, `label`, `kind`, `enabled`, `priority`, and `config` (secrets such as auth headers MAY be redacted if added later).

#### Scenario: List returns configured connectors

- **WHEN** an admin client requests the connector list
- **THEN** the response status is 200 and includes persisted connectors

### Requirement: Create connector

The API application SHALL expose `POST /api/v1/admin/connectors` accepting `label`, `kind`, `enabled`, `priority`, and `config` validated against the shared connector config schema for the given `kind`.

#### Scenario: Create manual connector

- **WHEN** a valid manual connector payload is posted
- **THEN** the response status is 201 (or 200) and the connector is persisted and retrievable by id

#### Scenario: Invalid config rejected

- **WHEN** `config` does not match the schema for the declared `kind`
- **THEN** the response status is 400

### Requirement: Update connector

The API application SHALL expose `PATCH` or `PUT` on `/api/v1/admin/connectors/:id` to update `label`, `enabled`, `priority`, and/or `config`.

#### Scenario: Disable connector

- **WHEN** an admin sets `enabled` to false on a connector
- **THEN** subsequent resolve calls exclude that connector

### Requirement: Delete connector

The API application SHALL expose `DELETE /api/v1/admin/connectors/:id` removing the connector record.

#### Scenario: Delete removes connector

- **WHEN** an admin deletes a connector by id
- **THEN** a subsequent list request does not include that connector

### Requirement: Test connector

The API application SHALL expose `POST /api/v1/admin/connectors/:id/test` with body `{ "mediaRef": <MediaRef> }` that runs only that connector’s driver and returns validated `sources` plus a diagnostic object indicating success or failure reason.

#### Scenario: Test succeeds

- **WHEN** the connector resolves valid sources for the supplied `mediaRef`
- **THEN** the response includes `sources` and a success indicator

#### Scenario: Test reports failure

- **WHEN** the connector errors or returns invalid data
- **THEN** the response includes a failure reason suitable for operators (not shown to subscribers on the public resolve endpoint)

### Requirement: Admin routes unauthenticated in Phase 2

Admin connector routes SHALL require a valid admin session when `NODE_ENV=production` and setup is complete. In development, routes MAY remain unauthenticated when `ADMIN_AUTH_DISABLED=true` is set.

#### Scenario: Production admin CRUD requires auth

- **WHEN** a client calls admin connector routes in production without a valid session after setup is complete
- **THEN** the response status is 401

#### Scenario: Local admin CRUD without auth in development

- **WHEN** a client calls admin connector routes in development with auth disabled flag set
- **THEN** CRUD and Test operations succeed per validation rules without credentials

