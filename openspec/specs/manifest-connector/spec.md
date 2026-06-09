# manifest-connector Specification

## Purpose
Playback-only manifest connector resolving sources from static JSON lookup.
## Requirements
### Requirement: Manifest connector resolves from static JSON

A `manifest` connector SHALL fetch a JSON manifest URL and return sources for matching `mediaRef` entries.

#### Scenario: Manifest entry match

- **WHEN** manifest contains an entry for the requested `mediaRef`
- **THEN** resolve returns the entry sources with connectorId set

