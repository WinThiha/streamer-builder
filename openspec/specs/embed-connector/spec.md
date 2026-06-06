# embed-connector Specification

## Purpose
Let operators configure iframe embed players via URL templates without a separate resolver service, producing validated embed sources per title.
## Requirements
### Requirement: Embed connector config

An embed connector SHALL store a `urlTemplate` string and optional `sourceLabel`. The template SHALL support placeholders `{id}`, `{type}`, `{season}`, and `{episode}` replaced with URL-encoded values from the resolve `MediaRef`. Missing TV fields for movie refs SHALL substitute as empty strings.

#### Scenario: Movie embed URL generated

- **WHEN** resolve runs for `{ "provider": "tmdb", "type": "movie", "id": "550" }` with template `https://host/m/{id}`
- **THEN** the driver produces one source with `kind: "embed"` and url `https://host/m/550`

#### Scenario: TV embed URL includes season and episode

- **WHEN** resolve runs for a TV episode media ref with season 1 episode 2 and template `https://host/tv/{id}?s={season}&e={episode}`
- **THEN** the generated URL contains `s=1` and `e=2`

#### Scenario: Generated URL validated

- **WHEN** the embed driver interpolates a template
- **THEN** the resulting source passes shared `sourceSchema` validation including valid absolute URL

### Requirement: Embed template config validation

The API SHALL reject embed connector configs whose interpolated sample URL (using a reference movie `MediaRef`) fails URL validation or whose template omits `{id}`.

#### Scenario: Invalid template rejected on create

- **WHEN** an admin posts an embed connector with template `not-a-url/{id}`
- **THEN** the response status is 400

