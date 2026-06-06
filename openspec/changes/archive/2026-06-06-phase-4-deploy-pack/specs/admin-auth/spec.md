## ADDED Requirements

### Requirement: Admin login endpoint

The API application SHALL expose `POST /api/v1/admin/auth/login` accepting admin credentials and, on success, establishing an authenticated session via HTTP-only cookie.

#### Scenario: Successful login

- **WHEN** a client submits the correct admin password after setup is complete
- **THEN** the response status is 200 and a session cookie is set

#### Scenario: Failed login

- **WHEN** a client submits an incorrect admin password
- **THEN** the response status is 401 and no session cookie is set

### Requirement: Admin logout endpoint

The API application SHALL expose `POST /api/v1/admin/auth/logout` that invalidates the current session and clears the session cookie.

#### Scenario: Logout clears session

- **WHEN** an authenticated admin calls logout
- **THEN** subsequent admin API requests without a new login return 401

### Requirement: Session validation middleware

The API application SHALL validate admin session cookies on all `/api/v1/admin/*` routes except setup and auth login routes when running in production (`NODE_ENV=production`) and setup is complete.

#### Scenario: Unauthenticated admin request rejected in production

- **WHEN** a client calls `GET /api/v1/admin/site/config` in production without a valid session
- **THEN** the response status is 401

#### Scenario: Authenticated admin request succeeds

- **WHEN** a client calls an admin route with a valid session cookie after login
- **THEN** the request succeeds per existing admin route validation rules

### Requirement: Development auth bypass flag

When `NODE_ENV=development` and `ADMIN_AUTH_DISABLED=true`, admin routes MAY be reachable without authentication for local convenience. This bypass SHALL NOT apply when `NODE_ENV=production`.

#### Scenario: Dev bypass enabled

- **WHEN** the API runs in development with auth disabled flag set
- **THEN** admin routes succeed without a session cookie

#### Scenario: Production never bypasses auth

- **WHEN** the API runs with `NODE_ENV=production`
- **THEN** admin routes require a valid session regardless of any dev bypass flag

### Requirement: Web admin login route

The web application SHALL provide `/admin/login` and SHALL redirect unauthenticated users away from `/admin/*` routes to login when setup is complete and the deployment requires auth.

#### Scenario: Unauthenticated admin redirect

- **WHEN** a user navigates to `/admin/branding` without a valid session in production
- **THEN** the browser is redirected to `/admin/login`

#### Scenario: Successful login reaches admin

- **WHEN** a user submits valid credentials on `/admin/login`
- **THEN** the browser navigates to the admin shell (e.g. `/admin/branding`)

### Requirement: Session secret required in production

Production deployments SHALL require a strong `SESSION_SECRET` (or equivalent) in environment validation when `NODE_ENV=production`.

#### Scenario: Missing session secret fails production startup

- **WHEN** the API starts in production without a session secret configured
- **THEN** the process exits with a descriptive validation error
