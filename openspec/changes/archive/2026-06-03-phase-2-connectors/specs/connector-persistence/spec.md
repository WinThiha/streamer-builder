## ADDED Requirements

### Requirement: Connectors table schema

The API application SHALL persist connector configuration in PostgreSQL using a Drizzle-defined `connectors` table with at least: unique `id`, human-readable `label`, `kind` (`demo` | `manual` | `http`), `enabled` boolean, JSON `config` matching the shared connector config schema, numeric `priority` for sort order, and `createdAt` / `updatedAt` timestamps.

#### Scenario: Connector row stores manual config

- **WHEN** an admin creates a manual connector with static source URLs in `config`
- **THEN** the row is persisted and readable on subsequent API startup

### Requirement: Database migrations for connectors

The API package SHALL provide a migration workflow (e.g. drizzle-kit) that creates and updates the `connectors` table without manual SQL in normal development.

#### Scenario: Fresh database migrates successfully

- **WHEN** a developer runs the documented migration command against an empty database
- **THEN** the `connectors` table exists and the API can query it

### Requirement: Default connector seed

The system SHALL provide a documented seed path (migration seed or script) that inserts at least one enabled `demo` connector so resolve works on a fresh install without manual setup.

#### Scenario: Seeded demo connector available

- **WHEN** migrations and seed complete on a fresh database
- **THEN** at least one enabled `demo` connector exists

### Requirement: Repository loads enabled connectors

The API application SHALL load only connectors where `enabled` is true when resolving playback, ordered by `priority` ascending then `label`.

#### Scenario: Disabled connector excluded from resolve

- **WHEN** a connector is saved with `enabled: false`
- **THEN** `POST /api/v1/play/resolve` does not invoke that connector
