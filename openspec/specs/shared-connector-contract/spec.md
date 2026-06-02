# shared-connector-contract Specification

## Purpose

Shared Zod schemas and TypeScript types for connector contract v1 (`MediaRef`, `Source`, resolve request/response) in `packages/shared`.
## Requirements
### Requirement: MediaRef schema exported

The `packages/shared` package SHALL export a Zod schema and inferred TypeScript type for `MediaRef` with fields: `provider`, `type`, `id`, and optional `season` and `episode` where applicable.

#### Scenario: Valid movie reference parses

- **WHEN** a consumer parses `{ "provider": "tmdb", "type": "movie", "id": "550" }` with the MediaRef schema
- **THEN** parsing succeeds and the inferred type is available

#### Scenario: Invalid reference rejects

- **WHEN** a consumer parses an object missing required fields with the MediaRef schema
- **THEN** parsing fails with a Zod validation error

### Requirement: Source schema exported

The `packages/shared` package SHALL export a Zod schema and inferred type for `Source` with at least: `id`, `connectorId`, `label`, `kind` (`hls` | `progressive` | `embed`), `url`, and optional `expiresAt` and `subtitles`.

#### Scenario: Valid HLS source parses

- **WHEN** a consumer parses a source object with `kind: "hls"` and a valid `url`
- **THEN** parsing succeeds

### Requirement: Resolve request and response schemas exported

The `packages/shared` package SHALL export Zod schemas for resolve v1 request (containing `mediaRef`) and response (containing `sources` array of `Source`).

#### Scenario: Resolve response shape

- **WHEN** a consumer parses `{ "sources": [] }` as a resolve response
- **THEN** parsing succeeds with an empty sources array

