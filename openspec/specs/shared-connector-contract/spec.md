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

The `packages/shared` package SHALL export Zod schemas for resolve v1 request (containing required `mediaRef` and optional `metadata`) and response (containing `sources` array of `Source`).

#### Scenario: Resolve response shape

- **WHEN** a consumer parses `{ "sources": [] }` as a resolve response
- **THEN** parsing succeeds with an empty sources array

#### Scenario: Resolve request with metadata

- **WHEN** a consumer parses a resolve request including `mediaRef` and `metadata: { "title": "Example" }`
- **THEN** parsing succeeds

### Requirement: Connector config schemas exported

The `packages/shared` package SHALL export Zod schemas for connector configuration discriminated by `kind`: `demo` (optional label override), `manual` (static `sources[]`), `http` (`resolveUrl` and optional timeout), and `embed` (`urlTemplate` and optional `sourceLabel`). Inferred TypeScript types SHALL be exported for API and admin use.

#### Scenario: Manual config parses

- **WHEN** a consumer parses a manual config with a non-empty `sources` array of valid `Source` objects
- **THEN** parsing succeeds

#### Scenario: HTTP config requires resolveUrl

- **WHEN** a consumer parses an http config without `resolveUrl`
- **THEN** parsing fails with a Zod validation error

#### Scenario: Embed config parses

- **WHEN** a consumer parses an embed config with a valid `urlTemplate` containing `{id}`
- **THEN** parsing succeeds

### Requirement: Resolve request optional metadata

The resolve request schema SHALL require `mediaRef` and MAY include an optional `metadata` object for forward-compatible enrichment (e.g. TMDB title fields) without requiring clients to send it in Phase 2.

#### Scenario: Resolve request without metadata

- **WHEN** a consumer parses `{ "mediaRef": { "provider": "tmdb", "type": "movie", "id": "550" } }`
- **THEN** parsing succeeds

### Requirement: Embed connector config schema

The `packages/shared` package SHALL export an `embed` connector config schema with fields: `kind: "embed"`, `urlTemplate` (non-empty string containing `{id}`), and optional `sourceLabel` (defaults to connector label at resolve time).

#### Scenario: Valid embed config parses

- **WHEN** a consumer parses `{ "kind": "embed", "urlTemplate": "https://player.example/embed/{type}/{id}?s={season}&e={episode}" }`
- **THEN** parsing succeeds

#### Scenario: Embed config without id placeholder rejected

- **WHEN** a consumer parses an embed config whose `urlTemplate` does not contain `{id}`
- **THEN** parsing fails with a validation error

### Requirement: Embed connector kind in connector kind enum

The shared `connectorKindSchema` SHALL include `embed` as a valid connector kind alongside `demo`, `manual`, and `http`.

#### Scenario: Embed kind accepted

- **WHEN** a consumer validates `kind: "embed"` against `connectorKindSchema`
- **THEN** validation succeeds

