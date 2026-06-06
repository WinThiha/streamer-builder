## MODIFIED Requirements

### Requirement: Admin routes unauthenticated in Phase 2

Admin connector routes SHALL require a valid admin session when `NODE_ENV=production` and setup is complete. In development, routes MAY remain unauthenticated when `ADMIN_AUTH_DISABLED=true` is set.

#### Scenario: Production admin CRUD requires auth

- **WHEN** a client calls admin connector routes in production without a valid session after setup is complete
- **THEN** the response status is 401

#### Scenario: Local admin CRUD without auth in development

- **WHEN** a client calls admin connector routes in development with auth disabled flag set
- **THEN** CRUD and Test operations succeed per validation rules without credentials
