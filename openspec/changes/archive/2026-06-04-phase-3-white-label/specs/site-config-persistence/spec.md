## ADDED Requirements

### Requirement: Site config singleton table

The API application SHALL persist site configuration in PostgreSQL using a singleton `site_config` table (single logical site per deployment) with at least: fixed row id, `draft` JSONB, `published` JSONB, `updated_at`, and `published_at` timestamps.

#### Scenario: Draft and published stored separately

- **WHEN** an admin updates draft and later publishes
- **THEN** the `published` column reflects the published snapshot and `draft` may continue to hold in-progress edits

### Requirement: Site config migration

The API package SHALL provide SQL migration `0001_site_config` (or equivalent) that creates the `site_config` table, and the migration runner SHALL apply all ordered SQL files in `drizzle/` so Phase 3 migrations run on startup.

#### Scenario: Fresh database includes site_config

- **WHEN** migrations run on an empty database
- **THEN** the `site_config` table exists

### Requirement: Default site config seed

The system SHALL seed site configuration on API startup when no row exists, setting `draft` and `published` to the shared `defaultSiteConfig` so public endpoints work before first admin visit.

#### Scenario: Seeded config on first boot

- **WHEN** the API starts with an empty `site_config` table
- **THEN** one row exists with identical draft and published matching `defaultSiteConfig`

### Requirement: Repository validates on read and write

The site config repository SHALL parse `draft` and `published` through `siteConfigSchema` on read and SHALL validate before persisting writes.

#### Scenario: Invalid draft rejected

- **WHEN** an admin PATCH supplies JSON that fails `siteConfigSchema`
- **THEN** the API returns HTTP 400 and does not persist the invalid draft
