# source-picker-ui Specification

## Purpose

Subscriber play page integration: resolve on load, source selection UI, and Shaka playback for HLS/progressive sources.
## Requirements
### Requirement: Play page resolves sources

The web application SHALL call `POST /api/v1/play/resolve` with the current `MediaRef` when the user opens `/play`, using the shared resolve request/response shapes.

#### Scenario: Resolve on play load

- **WHEN** a user navigates to `/play` with a valid `mediaRef` in location state
- **THEN** the client requests resolve and receives a `sources` array

### Requirement: Source picker UI

The web application SHALL display a source picker listing resolved sources by `label` (and MAY show `connectorId` or kind as secondary text) when more than one source is available, and SHALL allow the user to select which source to play.

#### Scenario: Two sources shown

- **WHEN** resolve returns two distinct sources
- **THEN** both appear in the picker and the user can switch between them

#### Scenario: Single source auto-selected

- **WHEN** resolve returns exactly one source
- **THEN** that source is selected and playback begins without requiring an extra click

### Requirement: Player loads selected source

The web application SHALL pass the selected source `url` to Shaka Player for `hls` and `progressive` kinds.

#### Scenario: Switching source reloads player

- **WHEN** the user selects a different source in the picker
- **THEN** Shaka Player loads the new URL

### Requirement: Resolve loading and error states

The web application SHALL show loading while resolve is in progress and a user-visible error when resolve fails at the HTTP level or returns no playable sources.

#### Scenario: Empty sources message

- **WHEN** resolve succeeds with an empty `sources` array
- **THEN** the play page shows that no streams are available

#### Scenario: Resolve request fails

- **WHEN** the resolve request returns a non-success HTTP status
- **THEN** an error message is displayed on the play page

### Requirement: MediaRef context on play page

The play page SHALL continue to display title context from router state and `MediaRef` (type, id, season/episode) independent of which source is selected.

#### Scenario: Context visible with picker

- **WHEN** a user plays a TV episode with season and episode selected
- **THEN** the play page shows that context alongside the source picker

### Requirement: Embed sources played via iframe

When a resolved source has `kind: "embed"`, the web application SHALL render a responsive sandboxed iframe loading the source `url` instead of Shaka Player.

#### Scenario: Embed source plays in iframe

- **WHEN** the user selects an embed source on the play page
- **THEN** an iframe is displayed with `src` set to the source URL

#### Scenario: Embed open in new tab fallback

- **WHEN** an embed source is selected
- **THEN** the play page provides a link to open the embed URL in a new browser tab

#### Scenario: Single embed source shows context

- **WHEN** resolve returns exactly one embed source
- **THEN** the play page shows the source label or kind badge even when the source picker is hidden

