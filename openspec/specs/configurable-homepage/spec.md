# configurable-homepage Specification

## Purpose
TBD - created by archiving change phase-3-white-label. Update Purpose after archive.
## Requirements
### Requirement: Catalog home uses published homepage blocks

The API application SHALL build the response for `GET /api/v1/catalog/home` from the **published** site config homepage blocks, fetching TMDB data for each block's `categoryKey` in order.

#### Scenario: Home rows match published blocks

- **WHEN** published config lists `popular_movies` then `popular_tv` as blocks
- **THEN** `GET /api/v1/catalog/home` returns rows in that order for those categories

#### Scenario: Draft blocks do not affect public home

- **WHEN** draft homepage blocks differ from published
- **THEN** `GET /api/v1/catalog/home` reflects published blocks only

### Requirement: Preview home uses draft blocks

The API application SHALL expose an admin-only endpoint (e.g. `GET /api/v1/admin/site/preview-home`) that returns the same catalog home shape as `/catalog/home` but using **draft** homepage blocks for admin preview.

#### Scenario: Preview home reflects draft

- **WHEN** draft removes a homepage block and admin requests preview home
- **THEN** the preview home response omits that row while public `/catalog/home` is unchanged

### Requirement: Block labels from config or defaults

Each catalog row in the home response SHALL use an optional admin-provided label from the block config or a default label derived from the `categoryKey`.

#### Scenario: Custom row label

- **WHEN** a block specifies `label: "Top Picks"`
- **THEN** the corresponding home row display name is `Top Picks`

