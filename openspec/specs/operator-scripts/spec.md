# operator-scripts Specification

## Purpose
Provide install, update, and backup shell scripts so operators can deploy and maintain the production stack with minimal DevOps.
## Requirements
### Requirement: Install script

The Deploy Pack SHALL include `scripts/install.sh` (or equivalent) that verifies Docker and Compose availability, creates `.env` from template when missing, generates missing secrets, starts the stack, waits for health endpoints, and prints the setup URL and next steps.

#### Scenario: Fresh install on empty directory

- **WHEN** an operator runs `install.sh` with Docker available and no existing `.env`
- **THEN** a `.env` file is created from template, services start, and the script prints the `/setup` URL

#### Scenario: Install fails without Docker

- **WHEN** an operator runs `install.sh` without Docker installed
- **THEN** the script exits non-zero with a clear error message

### Requirement: Update script

The Deploy Pack SHALL include `scripts/update.sh` that pulls the configured image tag (or rebuilds when using build override), recreates containers, waits for health checks, and reports success or failure.

#### Scenario: Update to new image tag

- **WHEN** an operator sets a new `IMAGE_TAG` and runs `update.sh`
- **THEN** containers are recreated with the new images and health checks pass

### Requirement: Backup script

The Deploy Pack SHALL include `scripts/backup.sh` that creates a timestamped backup including a PostgreSQL dump and the API uploads directory.

#### Scenario: Backup produces restorable artifacts

- **WHEN** an operator runs `backup.sh` on a running deployment
- **THEN** a backup directory or archive is created containing a SQL dump and uploads files

### Requirement: Operator quickstart documentation

The Deploy Pack SHALL include `QUICKSTART.md` documenting DNS setup, required `.env` fields, install steps, setup wizard flow, connector test, update procedure, backup/restore overview, and common troubleshooting (TLS, TMDB key, health checks).

#### Scenario: Operator follows quickstart end-to-end

- **WHEN** an operator follows QUICKSTART on a fresh VPS with DNS configured
- **THEN** they can reach `/setup`, complete setup, access admin, and play a resolved stream

