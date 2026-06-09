## ADDED Requirements

### Requirement: Prototype mode bypasses customer setup

When `APP_MODE=prototype`, the API SHALL seed deployment settings as setup-complete and the web app SHALL NOT redirect visitors to `/setup`.

#### Scenario: Fresh database in prototype mode

- **WHEN** the API boots with `APP_MODE=prototype`
- **THEN** setup status reports complete without requiring `/setup`

### Requirement: Prototype restricts connectors to demo

When `APP_MODE=prototype`, only `demo` connectors SHALL be enabled and admin connector CRUD for `http`, `manual`, and `embed` SHALL be rejected.

#### Scenario: Attempt to create HTTP connector in prototype mode

- **WHEN** an admin POST creates an `http` connector while `APP_MODE=prototype`
- **THEN** the API returns HTTP 403
