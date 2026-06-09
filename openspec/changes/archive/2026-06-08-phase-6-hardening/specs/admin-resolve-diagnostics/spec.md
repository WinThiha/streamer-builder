## ADDED Requirements

### Requirement: Admin resolve exposes connector diagnostics

`POST /v1/admin/play/resolve` SHALL return per-connector outcomes in addition to merged sources.

#### Scenario: Partial connector failure

- **WHEN** one connector fails and another succeeds
- **THEN** admin response includes `connectorResults` with ok/error per connector and subscriber resolve still returns only sources
