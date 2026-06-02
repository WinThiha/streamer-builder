## ADDED Requirements

### Requirement: Demo stream endpoint

The API application SHALL expose `GET /api/v1/play/demo` returning a single playback source object compatible with the shared `Source` schema with `kind: "hls"` and a legal demo stream URL.

#### Scenario: Demo source returned

- **WHEN** a client requests `GET /api/v1/play/demo`
- **THEN** the response status is 200 and the body contains one HLS source with a valid URL

### Requirement: Play page with Shaka Player

The web application SHALL provide a play page at `/play` that initializes Shaka Player, loads the demo HLS stream, and renders video in a player container.

#### Scenario: Video playback starts

- **WHEN** a user arrives at `/play` with a valid MediaRef and the demo stream is reachable
- **THEN** Shaka Player loads the HLS stream and video playback begins

### Requirement: Play page shows MediaRef context

The web application SHALL display contextual metadata on the play page derived from the carried MediaRef (e.g. type and id), even though the stream URL is the same demo for all titles.

#### Scenario: Context displayed

- **WHEN** a user plays a movie with id `550`
- **THEN** the play page indicates the selected title context while playing the demo stream

### Requirement: Playback error handling

The web application SHALL display a user-visible error if Shaka Player fails to load or play the demo stream.

#### Scenario: Stream load failure

- **WHEN** the demo HLS stream fails to load
- **THEN** an error message is displayed on the play page

### Requirement: Player cleanup on unmount

The web application SHALL destroy or unload the Shaka Player instance when the play page unmounts to avoid resource leaks during navigation.

#### Scenario: Navigate away from play

- **WHEN** a user navigates away from `/play`
- **THEN** the Shaka Player instance is cleaned up without console errors from stale instances
