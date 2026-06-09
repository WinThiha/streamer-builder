# url-safety Specification

## Purpose
Shared outbound URL validation to prevent SSRF and unsafe resolver targets.
## Requirements
### Requirement: HTTP resolver URLs are SSRF-safe in production

In production, HTTP connector `resolveUrl` SHALL NOT target localhost, private IP ranges, or link-local addresses.

#### Scenario: Save connector with private IP URL

- **WHEN** an admin saves an HTTP connector with `resolveUrl` `http://192.168.1.1/resolve` in production
- **THEN** the API returns HTTP 400

### Requirement: Dev allows localhost

In development, localhost resolver URLs SHALL be permitted.

#### Scenario: Save localhost resolver in dev

- **WHEN** `NODE_ENV=development` and resolveUrl is `http://127.0.0.1:8080/resolve`
- **THEN** the connector save succeeds

