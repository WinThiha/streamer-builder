## ADDED Requirements

### Requirement: Admin shell requires authentication in production

The admin shell at `/admin` SHALL require a valid admin session in production after setup is complete. Unauthenticated users SHALL be redirected to `/admin/login`.

#### Scenario: Admin shell blocked without session

- **WHEN** an unauthenticated user navigates to `/admin/branding` in production after setup is complete
- **THEN** the browser is redirected to `/admin/login`

### Requirement: Setup wizard connector step

The `/setup` flow SHALL include an optional step to create a first connector of kind `http` or `manual`, using the same shared connector config validation as the admin API.

#### Scenario: Setup creates HTTP connector

- **WHEN** an operator completes setup with a valid HTTP connector configuration
- **THEN** the connector is persisted and appears in subsequent resolve results when enabled

#### Scenario: Setup skips optional connector

- **WHEN** an operator completes setup without providing a connector
- **THEN** setup still completes and seeded demo connectors remain available for playback

### Requirement: Logout action in admin shell

The admin shell SHALL provide a logout action that clears the admin session and returns the user to `/admin/login`.

#### Scenario: Logout from admin

- **WHEN** an authenticated admin activates logout
- **THEN** subsequent navigation to `/admin/*` requires login again
