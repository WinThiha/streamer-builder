# web-foundation Specification

## Purpose

Vite + React subscriber shell with routing, Tailwind theming scaffold, and API integration for local development.
## Requirements
### Requirement: Web dev server runs

The web application SHALL start via Vite dev server on port 5173 (or configured port) and render a shell layout with catalog browse content on the home page.

#### Scenario: Home page loads

- **WHEN** a user opens the web app root URL in a browser during development
- **THEN** a shell layout with catalog browse rows or loading state is visible

### Requirement: API URL configuration

The web application SHALL read the API base URL from environment (e.g. `VITE_API_URL`) and SHALL use it for API requests (health check or placeholder fetch acceptable in Phase 0).

#### Scenario: Env-driven API base

- **WHEN** `VITE_API_URL` is set to `http://localhost:3001`
- **THEN** client-side API calls target that base URL

### Requirement: Client routing shell

The web application SHALL use React Router with routes for home (`/`), search (`/search`), movie detail (`/movie/:id`), TV detail (`/tv/:id`), play (`/play`), at least one secondary informational route, and an admin route tree under `/admin` (including `/admin/branding`, `/admin/homepage`, and `/admin/preview`).

#### Scenario: Navigate between routes

- **WHEN** a user navigates between defined catalog and detail routes
- **THEN** the URL and displayed content update without full page reload

#### Scenario: Play route reachable

- **WHEN** a user navigates to `/play` from a detail page Play action
- **THEN** the play page renders without full page reload

#### Scenario: Admin route reachable

- **WHEN** a user navigates to `/admin/branding`
- **THEN** the admin branding page renders without full page reload

### Requirement: Site config provider and runtime theme

The web application SHALL fetch published site configuration on startup (via `GET /api/v1/site/config`) and SHALL apply theme tokens to CSS variables on `document.documentElement` so subscriber UI reflects published branding without a rebuild.

#### Scenario: Published theme applied

- **WHEN** published config sets a distinct primary color
- **THEN** subscriber pages use that primary color via CSS variables

### Requirement: Subscriber shell branding from config

The subscriber shell header SHALL display the published site name and logo (when configured) instead of hardcoded product defaults.

#### Scenario: Custom site name in header

- **WHEN** published config sets `siteName` to `Acme Stream`
- **THEN** the subscriber header shows `Acme Stream`

### Requirement: Admin route tree

The web application SHALL include React Router routes under `/admin` for branding, homepage, and preview as defined in the site-admin-ui capability, in addition to existing subscriber routes.

#### Scenario: Admin routes do not replace subscriber routes

- **WHEN** a user navigates to `/` and `/admin/branding`
- **THEN** both routes render their respective shells without conflict

