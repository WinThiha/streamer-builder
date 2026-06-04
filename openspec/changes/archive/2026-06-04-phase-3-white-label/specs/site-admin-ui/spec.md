## ADDED Requirements

### Requirement: Admin shell route tree

The web application SHALL provide an admin shell at `/admin` with nested routes for branding, homepage configuration, and draft preview, separate from the subscriber shell navigation.

#### Scenario: Admin branding route

- **WHEN** a user navigates to `/admin/branding`
- **THEN** an admin layout with branding form is displayed without subscriber catalog navigation

#### Scenario: Link to subscriber site

- **WHEN** a user activates "View site" (or equivalent) in the admin shell
- **THEN** the browser navigates to `/` showing the published subscriber experience

### Requirement: Branding admin form

The admin branding page SHALL allow editing site name, theme color tokens, and logo via external URL or file upload to the admin logo endpoint.

#### Scenario: Save draft branding

- **WHEN** an admin changes site name and saves draft
- **THEN** the draft is persisted via `PATCH /api/v1/admin/site/config/draft` and the subscriber site at `/` is unchanged until publish

#### Scenario: Upload logo from admin

- **WHEN** an admin selects a logo file and uploads
- **THEN** the draft logo is updated to the uploaded asset and preview can show the new logo

### Requirement: Homepage admin form

The admin homepage page SHALL allow selecting `templateId` (`hero-rows` or `grid-first`) and configuring ordered homepage category blocks from the shared allowlist.

#### Scenario: Reorder homepage blocks

- **WHEN** an admin reorders category blocks and saves draft
- **THEN** the draft homepage block order is persisted

### Requirement: Draft preview route

The web application SHALL provide `/admin/preview` that renders the subscriber home experience using **draft** site configuration (theme, template, identity) without affecting the public `/` route until publish.

#### Scenario: Preview shows draft theme

- **WHEN** an admin changes draft primary color and opens `/admin/preview`
- **THEN** the preview reflects the draft primary color while `/` still uses published colors

### Requirement: Publish workflow in admin UI

The admin shell SHALL provide explicit actions to save draft (if not auto-saving) and publish, with visible indication of unpublished draft changes.

#### Scenario: Publish updates subscriber site

- **WHEN** an admin publishes draft branding changes
- **THEN** navigating to `/` shows the updated published branding without rebuilding the web bundle
