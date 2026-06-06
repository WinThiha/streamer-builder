## ADDED Requirements

### Requirement: Setup and login routes

The web application SHALL include React Router routes for `/setup` and `/admin/login` in addition to existing subscriber and admin routes.

#### Scenario: Setup route reachable

- **WHEN** a user navigates to `/setup` on an incomplete deployment
- **THEN** the setup wizard page renders without full page reload

#### Scenario: Admin login route reachable

- **WHEN** a user navigates to `/admin/login` after setup is complete
- **THEN** the login page renders without full page reload

### Requirement: Setup and auth redirect guards

The web application SHALL redirect users to `/setup` when setup is incomplete, and SHALL redirect unauthenticated users away from `/admin/*` to `/admin/login` in production after setup is complete.

#### Scenario: Admin blocked before setup

- **WHEN** setup is incomplete and a user navigates to `/admin/branding`
- **THEN** the browser is redirected to `/setup`

#### Scenario: Admin requires login after setup

- **WHEN** setup is complete, auth is required, and a user without a session navigates to `/admin/branding`
- **THEN** the browser is redirected to `/admin/login`

### Requirement: Production static API base URL

The production web build SHALL use an empty or same-origin `VITE_API_URL` so browser requests target `/api/*` through the Caddy reverse proxy.

#### Scenario: Production API calls use /api prefix

- **WHEN** the production web bundle loads on the customer domain
- **THEN** client API helpers request paths under `/api/v1/...` on the same origin
