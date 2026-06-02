# catalog-browsing Specification

## Purpose

Web home page with TMDB browse rows, media cards, featured hero, and navigation to title detail pages.
## Requirements
### Requirement: Home page displays catalog rows

The web application SHALL display TMDB browse rows on the home page (`/`), fetched from the catalog home API endpoint, with each item showing at least a poster image and title.

#### Scenario: Home rows visible

- **WHEN** a user opens `/` with the API and TMDB configured
- **THEN** at least one horizontal row of media items is visible with posters and titles

### Requirement: Catalog items link to detail pages

The web application SHALL navigate to `/movie/:id` or `/tv/:id` when a user selects a catalog item based on its type.

#### Scenario: Movie card navigation

- **WHEN** a user clicks a movie item on the home page
- **THEN** the browser navigates to `/movie/:id` for that movie

#### Scenario: TV card navigation

- **WHEN** a user clicks a TV item on the home page
- **THEN** the browser navigates to `/tv/:id` for that show

### Requirement: Loading and error states for browse

The web application SHALL show a loading indicator while catalog data is fetching and SHALL show a user-visible error message if the catalog API request fails.

#### Scenario: Loading state

- **WHEN** catalog home data is being fetched
- **THEN** a loading indicator is visible on the home page

#### Scenario: Error state

- **WHEN** the catalog home API request fails
- **THEN** an error message is displayed explaining that content could not be loaded

### Requirement: Search navigation in shell

The web application shell SHALL include navigation to a search page (`/search`).

#### Scenario: Navigate to search

- **WHEN** a user activates search navigation in the shell
- **THEN** the browser navigates to `/search`

