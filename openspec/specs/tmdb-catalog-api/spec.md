# tmdb-catalog-api Specification

## Purpose

Server-side TMDB client, environment validation, and Hono catalog routes that return normalized DTOs for browse, search, and detail.
## Requirements
### Requirement: TMDB API key validated at startup

The API application SHALL require `TMDB_API_KEY` in environment validation and SHALL fail fast at startup with a descriptive error if the key is missing or empty.

#### Scenario: Missing TMDB key fails startup

- **WHEN** the API starts without `TMDB_API_KEY` set
- **THEN** the process exits with a descriptive validation error

### Requirement: Home catalog endpoint

The API application SHALL expose `GET /api/v1/catalog/home` that returns a JSON array of catalog rows, each containing a display name and a list of catalog items with at least `id`, `type` (`movie` or `tv`), `title`, and `posterUrl`.

#### Scenario: Home rows returned

- **WHEN** a client requests `GET /api/v1/catalog/home` with a valid TMDB configuration
- **THEN** the response status is 200 and the body contains at least one row with catalog items

### Requirement: Search catalog endpoint

The API application SHALL expose `GET /api/v1/catalog/search` accepting a `q` query parameter and returning matching movies and TV shows as normalized catalog items.

#### Scenario: Search with query

- **WHEN** a client requests `GET /api/v1/catalog/search?q=inception`
- **THEN** the response status is 200 and the body contains search results including title metadata

#### Scenario: Search without query

- **WHEN** a client requests `GET /api/v1/catalog/search` without a `q` parameter
- **THEN** the response status is 400 with an error indicating the query is required

### Requirement: Movie detail endpoint

The API application SHALL expose `GET /api/v1/catalog/movie/:id` returning normalized movie detail including at least `id`, `title`, `overview`, `posterUrl`, `backdropUrl`, and `releaseDate`.

#### Scenario: Valid movie detail

- **WHEN** a client requests `GET /api/v1/catalog/movie/550`
- **THEN** the response status is 200 and the body contains movie detail for the requested id

#### Scenario: Unknown movie id

- **WHEN** a client requests `GET /api/v1/catalog/movie/:id` for a non-existent TMDB id
- **THEN** the response status is 404

### Requirement: TV detail and season endpoints

The API application SHALL expose `GET /api/v1/catalog/tv/:id` returning TV show detail with seasons list, and `GET /api/v1/catalog/tv/:id/season/:season` returning episodes for that season.

#### Scenario: Valid TV detail with seasons

- **WHEN** a client requests `GET /api/v1/catalog/tv/:id` for a valid TV show
- **THEN** the response status is 200 and the body includes show metadata and a seasons array

#### Scenario: Valid season episodes

- **WHEN** a client requests `GET /api/v1/catalog/tv/:id/season/1` for a valid show and season
- **THEN** the response status is 200 and the body includes an episodes array with episode numbers and titles

### Requirement: TMDB errors handled gracefully

The API application SHALL return appropriate HTTP status codes and error messages when TMDB requests fail, without exposing the TMDB API key in responses.

#### Scenario: TMDB upstream failure

- **WHEN** the TMDB API returns an error or is unreachable
- **THEN** the API returns a 502 or 503 with a generic error message and no API key in the body

