## ADDED Requirements

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
