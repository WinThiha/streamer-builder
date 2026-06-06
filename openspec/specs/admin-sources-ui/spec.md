# admin-sources-ui Specification

## Purpose
Provide a mini admin UI for creating, editing, testing, and deleting embed connectors after first-run setup.
## Requirements
### Requirement: Admin Sources route

The web application SHALL provide an admin route at `/admin/sources` within the admin shell for managing embed connectors.

#### Scenario: Sources nav link

- **WHEN** an authenticated admin opens the admin shell
- **THEN** a navigation link to Sources (or equivalent label) is visible

#### Scenario: Sources page lists connectors

- **WHEN** an admin navigates to `/admin/sources`
- **THEN** configured connectors are listed with label, kind, enabled state, and priority

### Requirement: Embed connector form

The admin Sources page SHALL provide a form to create and edit embed connectors with fields: label, priority, enabled, and urlTemplate, plus helper text documenting placeholders `{id}`, `{type}`, `{season}`, `{episode}`.

#### Scenario: Create embed connector

- **WHEN** an admin submits a valid embed connector form
- **THEN** the connector is persisted via the admin connectors API and appears in the list

#### Scenario: Edit embed connector

- **WHEN** an admin updates an existing embed connector's template and saves
- **THEN** subsequent resolve and test calls use the updated template

### Requirement: Connector test panel

The admin Sources page SHALL provide a test panel accepting a sample `MediaRef` (movie id or TV id with season/episode), invoking `POST /api/v1/admin/connectors/:id/test`, and displaying returned sources or error details including the generated embed URL.

#### Scenario: Test shows generated URL

- **WHEN** an admin tests an embed connector with a valid movie media ref
- **THEN** the panel shows success and the interpolated embed URL

#### Scenario: Test shows failure reason

- **WHEN** an embed connector test fails validation
- **THEN** the panel displays the error message from the test endpoint

### Requirement: Setup embed connector option

The `/setup` optional connector step SHALL offer embed template as a connector kind choice (recommended/default among connector types) with fields for label and urlTemplate, validated by the same shared embed config schema.

#### Scenario: Setup with embed connector

- **WHEN** an operator completes setup with a valid embed template configuration
- **THEN** setup completes and an enabled embed connector is persisted

#### Scenario: Setup without connector unchanged

- **WHEN** an operator completes setup without enabling the optional connector step
- **THEN** setup still completes and seeded demo connectors remain available

