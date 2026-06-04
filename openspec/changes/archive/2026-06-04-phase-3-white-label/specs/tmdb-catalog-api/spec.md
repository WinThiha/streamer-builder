## ADDED Requirements

### Requirement: Category key to TMDB mapping

The API application SHALL map each supported homepage `categoryKey` from site config to a specific TMDB API request implemented in the TMDB client (e.g. trending, popular movies, popular TV, top rated movies).

#### Scenario: Popular movies block

- **WHEN** published homepage includes a block with `categoryKey: "popular_movies"`
- **THEN** the catalog home builder fetches TMDB popular movies for that row

### Requirement: TMDB key is deployment-scoped

The API application SHALL use the deployment's `TMDB_API_KEY` environment variable for all TMDB catalog requests. The product SHALL NOT embed a vendor TMDB key in customer deliverables.

#### Scenario: Customer key used

- **WHEN** a customer deployment sets `TMDB_API_KEY` in environment
- **THEN** catalog home and search use that key server-side only

## MODIFIED Requirements

### Requirement: Home catalog endpoint

The API application SHALL expose `GET /api/v1/catalog/home` that returns a JSON array of catalog rows built from the **published** site configuration homepage blocks, each row containing a display name and a list of catalog items with at least `id`, `type` (`movie` or `tv`), `title`, and `posterUrl`.

#### Scenario: Home rows returned

- **WHEN** a client requests `GET /api/v1/catalog/home` with a valid TMDB configuration and published homepage blocks
- **THEN** the response status is 200 and the body contains rows corresponding to configured blocks

#### Scenario: Empty blocks edge case

- **WHEN** published homepage blocks is an empty array
- **THEN** the response status is 200 and the body contains an empty rows array or documented fallback behavior consistent with product defaults
