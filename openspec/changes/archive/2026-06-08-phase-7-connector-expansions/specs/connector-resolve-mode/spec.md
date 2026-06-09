## ADDED Requirements

### Requirement: First-good resolve mode

When `playback.connectorResolveMode` is `first-good`, the orchestrator SHALL return sources from the first successful connector by priority and skip remaining connectors.

#### Scenario: First connector succeeds

- **WHEN** resolve mode is `first-good` and the highest-priority connector returns sources
- **THEN** lower-priority connectors are not queried
