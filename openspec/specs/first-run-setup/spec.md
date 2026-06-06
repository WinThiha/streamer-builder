# first-run-setup Specification

## Purpose
Bootstrap a fresh deployment via `/setup` with admin credentials, TMDB key, and optional first connector before the site is fully operational.
## Requirements
### Requirement: Deployment settings persistence

The API application SHALL persist deployment settings in PostgreSQL including at minimum: admin password credential (hashed), TMDB API key, and setup completion timestamp. Settings SHALL be stored as a singleton row per deployment.

#### Scenario: Settings row created on first boot

- **WHEN** the API starts with migrations applied and no deployment settings row exists
- **THEN** a singleton settings record exists with setup marked incomplete

### Requirement: Setup status endpoint

The API application SHALL expose `GET /api/v1/setup/status` returning whether setup is complete and which bootstrap steps remain (e.g. admin password, TMDB key, optional connector).

#### Scenario: Incomplete setup reported

- **WHEN** a client requests setup status before setup is completed
- **THEN** the response indicates setup is incomplete and lists remaining steps

#### Scenario: Complete setup reported

- **WHEN** a client requests setup status after successful setup completion
- **THEN** the response indicates setup is complete

### Requirement: Setup completion endpoint

The API application SHALL expose `POST /api/v1/setup/complete` accepting admin password, TMDB API key, and optional first connector configuration (`http` or `manual` kinds). The endpoint SHALL validate inputs, persist settings, hash the admin password, store the TMDB key, optionally create the first connector, publish initial site configuration, and mark setup complete.

#### Scenario: Successful setup completion

- **WHEN** a client submits valid setup completion payload on an incomplete deployment
- **THEN** the response status is 200, setup is marked complete, TMDB key is persisted, and admin login becomes available

#### Scenario: Invalid TMDB key rejected

- **WHEN** a client submits an empty or invalid TMDB API key during setup
- **THEN** the response status is 400 and setup remains incomplete

#### Scenario: Setup blocked after completion

- **WHEN** a client attempts setup completion after setup is already complete without admin credentials
- **THEN** the response status is 403 or 409 and existing settings are not overwritten

### Requirement: Optional site config bootstrap import

When a valid `site.config.yaml` is present in the Deploy Pack, setup or first-boot seed SHALL import it into the site config singleton (draft and published) after schema validation. If absent, the system SHALL use `defaultSiteConfig`.

#### Scenario: YAML bootstrap imported

- **WHEN** setup completes and `site.config.yaml` is present with valid content
- **THEN** published site configuration reflects the imported YAML values

#### Scenario: Missing YAML uses defaults

- **WHEN** setup completes and no bootstrap YAML is present
- **THEN** published site configuration matches `defaultSiteConfig`

### Requirement: Web setup route

The web application SHALL provide `/setup` guiding the operator through admin password, TMDB key entry, and optional first connector configuration, calling setup API endpoints.

#### Scenario: Incomplete install redirects to setup

- **WHEN** a user visits `/` or `/admin` before setup is complete
- **THEN** the browser is redirected to `/setup`

#### Scenario: Completed setup redirects away from setup

- **WHEN** a user visits `/setup` after setup is complete
- **THEN** the browser is redirected to `/admin/login` or `/admin`

### Requirement: API boots before setup without TMDB env

The API application SHALL start successfully with only core infrastructure environment variables when `TMDB_API_KEY` is not set in environment, allowing the setup wizard to collect the key at runtime.

#### Scenario: API starts without TMDB env key

- **WHEN** the API starts with valid `DATABASE_URL` and no `TMDB_API_KEY` in environment on a fresh deployment
- **THEN** the process remains running and `/api/v1/setup/status` is reachable

