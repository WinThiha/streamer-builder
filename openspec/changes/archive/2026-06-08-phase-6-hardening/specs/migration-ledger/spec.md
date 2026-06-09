## ADDED Requirements

### Requirement: Migrations run once

The API SHALL record applied migration filenames in a `schema_migrations` table and skip already-applied files.

#### Scenario: Second API boot

- **WHEN** the API restarts after migrations ran
- **THEN** no duplicate DDL is executed for already-applied files
