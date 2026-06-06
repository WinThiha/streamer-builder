# play-resolve Specification

## Purpose

Resolve orchestration for playback: parallel connector drivers, validated merge, caching, and `POST /api/v1/play/resolve`.
## Requirements
### Requirement: Play resolve endpoint

The API application SHALL expose `POST /api/v1/play/resolve` accepting a body validated by the shared resolve request schema and returning a resolve response with a `sources` array validated by the shared resolve response schema.

#### Scenario: Valid resolve returns sources

- **WHEN** a client posts a valid `mediaRef` and at least one enabled connector returns valid sources
- **THEN** the response status is 200 and `sources` contains one or more entries

#### Scenario: Invalid request body rejected

- **WHEN** a client posts a body missing `mediaRef`
- **THEN** the response status is 400

### Requirement: Parallel connector resolution

The resolve orchestrator SHALL invoke all enabled connectors concurrently (e.g. `Promise.allSettled`) and SHALL NOT fail the entire resolve when a single connector errors.

#### Scenario: One connector fails others succeed

- **WHEN** two enabled connectors are configured and one throws or returns invalid data
- **THEN** the response still includes sources from the successful connector

### Requirement: Source validation and merge

The orchestrator SHALL validate each connector result with the shared `Source` schema, merge results, deduplicate by `url`, sort by connector priority then source `label`, and cap the result list to a documented maximum (e.g. 20 sources).

#### Scenario: Duplicate URLs deduped

- **WHEN** two connectors return the same `url` for a title
- **THEN** the resolve response contains that URL only once

### Requirement: Resolve result caching

The API application SHALL cache resolve results in memory keyed by `mediaRef` and connector configuration version, with a default TTL of approximately 15 minutes unless a source `expiresAt` implies a shorter effective lifetime.

#### Scenario: Repeated resolve uses cache

- **WHEN** the same `mediaRef` is resolved twice within the TTL without connector changes
- **THEN** the second request does not re-invoke external HTTP connectors

### Requirement: Demo connector driver

A `demo` connector SHALL return one HLS `Source` using the API environment demo stream URL.

#### Scenario: Demo connector produces HLS source

- **WHEN** resolve runs with an enabled demo connector
- **THEN** `sources` includes an entry with `kind: "hls"` and the configured demo URL

### Requirement: Manual connector driver

A `manual` connector SHALL return the static `sources[]` defined in its config without calling external services.

#### Scenario: Manual connector returns configured sources

- **WHEN** resolve runs with an enabled manual connector listing two static sources
- **THEN** both sources appear in the merged resolve response

### Requirement: HTTP connector driver

An `http` connector SHALL POST JSON `{ "mediaRef": <request mediaRef> }` to its configured `resolveUrl`, parse the JSON response, and validate `sources[]` from the response body.

#### Scenario: HTTP connector returns valid sources

- **WHEN** the remote resolver returns a valid `sources` array
- **THEN** those sources are included in the merge after validation

#### Scenario: HTTP connector invalid response ignored

- **WHEN** the remote resolver returns JSON that fails `Source` validation
- **THEN** that connector contributes no sources and resolve may still succeed from other connectors

### Requirement: Subscriber-safe empty resolve

When no connector returns valid sources, the API SHALL respond with HTTP 200 and `{ "sources": [] }` without exposing per-connector error details.

#### Scenario: All connectors fail

- **WHEN** every enabled connector fails or returns no valid sources
- **THEN** the response is 200 with an empty `sources` array

### Requirement: Embed connector driver

An `embed` connector SHALL interpolate its configured `urlTemplate` with the request `MediaRef`, validate the result as a single `Source` with `kind: "embed"`, and return it without calling external HTTP services.

#### Scenario: Embed connector produces embed source

- **WHEN** resolve runs with an enabled embed connector and valid template
- **THEN** `sources` includes one entry with `kind: "embed"` and the connector's `connectorId`

#### Scenario: Embed driver uses sourceLabel

- **WHEN** an embed connector config includes `sourceLabel: "My Player"`
- **THEN** the returned source `label` is `My Player`

#### Scenario: Embed driver defaults label to connector label

- **WHEN** an embed connector config omits `sourceLabel`
- **THEN** the returned source `label` matches the connector record label

