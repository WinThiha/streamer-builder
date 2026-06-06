# site-admin-ui Specification

## Purpose
Provide an authenticated admin shell for branding, homepage configuration, draft preview, publish workflow, setup/login routes, and embed source management.
## Requirements
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

### Requirement: Admin shell requires authentication in production

The admin shell at `/admin` SHALL require a valid admin session in production after setup is complete. Unauthenticated users SHALL be redirected to `/admin/login`.

#### Scenario: Admin shell blocked without session

- **WHEN** an unauthenticated user navigates to `/admin/branding` in production after setup is complete
- **THEN** the browser is redirected to `/admin/login`

### Requirement: Setup wizard connector step

The `/setup` flow SHALL include an optional step to create a first connector of kind `http` or `manual`, using the same shared connector config validation as the admin API.

#### Scenario: Setup creates HTTP connector

- **WHEN** an operator completes setup with a valid HTTP connector configuration
- **THEN** the connector is persisted and appears in subsequent resolve results when enabled

#### Scenario: Setup skips optional connector

- **WHEN** an operator completes setup without providing a connector
- **THEN** setup still completes and seeded demo connectors remain available for playback

### Requirement: Logout action in admin shell

The admin shell SHALL provide a logout action that clears the admin session and returns the user to `/admin/login`.

#### Scenario: Logout from admin

- **WHEN** an authenticated admin activates logout
- **THEN** subsequent navigation to `/admin/*` requires login again

### Requirement: Admin Sources navigation

The admin shell SHALL include navigation to `/admin/sources` for embed connector management, alongside existing branding, homepage, and preview routes.

#### Scenario: Sources route registered

- **WHEN** an authenticated admin navigates to `/admin/sources`
- **THEN** the admin layout renders the Sources management page

### Requirement: Setup optional embed connector

The first-run setup flow SHALL allow operators to optionally configure an embed connector using a URL template, in addition to existing HTTP and manual connector options.

#### Scenario: Embed option in setup

- **WHEN** an operator enables the optional connector step during setup
- **THEN** embed template is available as a connector kind with urlTemplate input

