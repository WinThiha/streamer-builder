## ADDED Requirements

### Requirement: Web dev server runs

The web application SHALL start via Vite dev server on port 5173 (or configured port) and render a shell layout.

#### Scenario: Home page loads

- **WHEN** a user opens the web app root URL in a browser during development
- **THEN** a shell layout with placeholder navigation or content is visible

### Requirement: API URL configuration

The web application SHALL read the API base URL from environment (e.g. `VITE_API_URL`) and SHALL use it for API requests (health check or placeholder fetch acceptable in Phase 0).

#### Scenario: Env-driven API base

- **WHEN** `VITE_API_URL` is set to `http://localhost:3001`
- **THEN** client-side API calls target that base URL

### Requirement: Client routing shell

The web application SHALL use React Router with at least two placeholder routes (e.g. home and a secondary page) to prove routing works.

#### Scenario: Navigate between routes

- **WHEN** a user navigates between defined placeholder routes
- **THEN** the URL and displayed content update without full page reload
