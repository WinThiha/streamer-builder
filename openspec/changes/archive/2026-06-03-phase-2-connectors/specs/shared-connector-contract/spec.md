## ADDED Requirements

### Requirement: Connector config schemas exported

The `packages/shared` package SHALL export Zod schemas for connector configuration discriminated by `kind`: `demo` (optional label override), `manual` (static `sources[]`), and `http` (`resolveUrl` and optional timeout). Inferred TypeScript types SHALL be exported for API and admin use.

#### Scenario: Manual config parses

- **WHEN** a consumer parses a manual config with a non-empty `sources` array of valid `Source` objects
- **THEN** parsing succeeds

#### Scenario: HTTP config requires resolveUrl

- **WHEN** a consumer parses an http config without `resolveUrl`
- **THEN** parsing fails with a Zod validation error

### Requirement: Resolve request optional metadata

The resolve request schema SHALL require `mediaRef` and MAY include an optional `metadata` object for forward-compatible enrichment (e.g. TMDB title fields) without requiring clients to send it in Phase 2.

#### Scenario: Resolve request without metadata

- **WHEN** a consumer parses `{ "mediaRef": { "provider": "tmdb", "type": "movie", "id": "550" } }`
- **THEN** parsing succeeds

## MODIFIED Requirements

### Requirement: Resolve request and response schemas exported

The `packages/shared` package SHALL export Zod schemas for resolve v1 request (containing required `mediaRef` and optional `metadata`) and response (containing `sources` array of `Source`).

#### Scenario: Resolve response shape

- **WHEN** a consumer parses `{ "sources": [] }` as a resolve response
- **THEN** parsing succeeds with an empty sources array

#### Scenario: Resolve request with metadata

- **WHEN** a consumer parses a resolve request including `mediaRef` and `metadata: { "title": "Example" }`
- **THEN** parsing succeeds
