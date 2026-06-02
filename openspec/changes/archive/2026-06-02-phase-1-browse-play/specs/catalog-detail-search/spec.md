## ADDED Requirements

### Requirement: Search page with query

The web application SHALL provide a search page at `/search` that accepts a text query, calls the catalog search API, and displays results as selectable media items.

#### Scenario: Search returns results

- **WHEN** a user enters a query and submits search on `/search`
- **THEN** matching movies and TV shows are displayed with poster and title

#### Scenario: Empty search results

- **WHEN** a user searches for a query with no matches
- **THEN** a message indicates no results were found

### Requirement: Movie detail page

The web application SHALL display a movie detail page at `/movie/:id` showing title, overview, poster/backdrop imagery, and a Play action.

#### Scenario: Movie detail loads

- **WHEN** a user navigates to `/movie/:id` for a valid movie
- **THEN** movie metadata and a Play button are visible

### Requirement: TV detail with season and episode selection

The web application SHALL display a TV detail page at `/tv/:id` with season selection and episode list, defaulting to season 1 when available, and SHALL allow selecting an episode before playback.

#### Scenario: TV detail with seasons

- **WHEN** a user navigates to `/tv/:id` for a valid TV show
- **THEN** show metadata, season selector, and episode list are visible

#### Scenario: Episode selection

- **WHEN** a user selects a different season on the TV detail page
- **THEN** the episode list updates for that season

### Requirement: Play action creates MediaRef

The web application SHALL construct a valid shared `MediaRef` when the user activates Play: `{ provider: "tmdb", type: "movie", id }` for movies, or `{ provider: "tmdb", type: "tv", id, season, episode }` for TV episodes, and SHALL navigate to the play page with that reference.

#### Scenario: Movie play MediaRef

- **WHEN** a user clicks Play on a movie detail page
- **THEN** the app navigates to `/play` carrying a MediaRef with `type: "movie"` and the movie id

#### Scenario: TV episode play MediaRef

- **WHEN** a user clicks Play on a TV detail page with season 2 episode 3 selected
- **THEN** the app navigates to `/play` carrying a MediaRef with `type: "tv"`, the show id, `season: 2`, and `episode: 3`
