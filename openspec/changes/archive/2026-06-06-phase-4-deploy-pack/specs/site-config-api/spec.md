## MODIFIED Requirements

### Requirement: Admin site routes unauthenticated in local dev

Site admin routes SHALL require a valid admin session when `NODE_ENV=production` and setup is complete. In development, routes MAY remain unauthenticated when `ADMIN_AUTH_DISABLED=true` is set.

#### Scenario: Production admin site config requires auth

- **WHEN** a client calls `GET /api/v1/admin/site/config` in production without a valid session after setup is complete
- **THEN** the response status is 401

#### Scenario: Admin site config without auth token in development

- **WHEN** a client calls `GET /api/v1/admin/site/config` in development with auth disabled flag set
- **THEN** the request succeeds without an Authorization header
