## MODIFIED Requirements

### Requirement: Web dev server runs

The web application SHALL start via Vite dev server on port 5173 (or configured port) and render a shell layout with catalog browse content on the home page.

#### Scenario: Home page loads

- **WHEN** a user opens the web app root URL in a browser during development
- **THEN** a shell layout with catalog browse rows or loading state is visible

### Requirement: Client routing shell

The web application SHALL use React Router with routes for home (`/`), search (`/search`), movie detail (`/movie/:id`), TV detail (`/tv/:id`), play (`/play`), and at least one secondary informational route.

#### Scenario: Navigate between routes

- **WHEN** a user navigates between defined catalog and detail routes
- **THEN** the URL and displayed content update without full page reload

#### Scenario: Play route reachable

- **WHEN** a user navigates to `/play` from a detail page Play action
- **THEN** the play page renders without full page reload
