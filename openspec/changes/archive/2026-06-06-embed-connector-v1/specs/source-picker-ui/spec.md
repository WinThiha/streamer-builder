## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Embed sources not played in Phase 2 UI

**Reason**: Embed playback is now supported via iframe for operator-configured embed connectors.

**Migration**: No data migration. Embed sources selected on the play page load in iframe instead of showing an unsupported message.
