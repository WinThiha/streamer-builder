## ADDED Requirements

### Requirement: Configure wizard collects deploy inputs

The web app SHALL provide `/configure` with steps for site name, theme colors, template, homepage blocks, and domain.

#### Scenario: Complete wizard steps

- **WHEN** a visitor fills all wizard steps
- **THEN** a valid wizard payload is available for preview and pack generation

### Requirement: Wizard live preview

The wizard SHALL render a scoped live preview of draft branding without persisting to customer admin DB.

#### Scenario: Preview draft theme

- **WHEN** the visitor changes primary color in the wizard
- **THEN** the preview frame updates immediately
