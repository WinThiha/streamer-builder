# deploy-pack-generation Specification

## Purpose
Server-side Deploy Pack zip generation from production templates and wizard payload.
## Requirements
### Requirement: Pack generation API returns zip

The API SHALL provide `POST /v1/vendor/pack` accepting wizard payload and returning a Deploy Pack zip.

#### Scenario: Generate pack from wizard

- **WHEN** a valid wizard payload is POSTed to `/v1/vendor/pack`
- **THEN** the response is `application/zip` containing docker-compose, scripts, `.env`, and `site.config.yaml`

### Requirement: Generated pack excludes vendor secrets

The generated `.env` SHALL NOT include the vendor `TMDB_API_KEY`.

#### Scenario: Inspect generated env

- **WHEN** the pack zip is extracted
- **THEN** `TMDB_API_KEY` is empty or absent for customer setup

