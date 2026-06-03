## MODIFIED Requirements

### Requirement: Play page with Shaka Player

The web application SHALL provide a play page at `/play` that resolves sources via `POST /api/v1/play/resolve`, initializes Shaka Player for the selected `hls` or `progressive` source, and renders video in a player container.

#### Scenario: Video playback starts

- **WHEN** a user arrives at `/play` with a valid MediaRef and resolve returns at least one HLS or progressive source
- **THEN** Shaka Player loads the selected stream and video playback begins

### Requirement: Play page shows MediaRef context

The web application SHALL display contextual metadata on the play page derived from the carried MediaRef (e.g. type, id, season, episode) and the selected title name from router state.

#### Scenario: Context displayed

- **WHEN** a user plays a movie with id `550`
- **THEN** the play page indicates the selected title context while playing the chosen source

## ADDED Requirements

### Requirement: Demo stream endpoint retained

The API application SHALL expose `GET /api/v1/play/demo` returning a single playback source compatible with the shared `Source` schema for development compatibility.

#### Scenario: Demo source returned

- **WHEN** a client requests `GET /api/v1/play/demo`
- **THEN** the response status is 200 and the body contains one HLS source with a valid URL
