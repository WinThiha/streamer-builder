## ADDED Requirements

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
