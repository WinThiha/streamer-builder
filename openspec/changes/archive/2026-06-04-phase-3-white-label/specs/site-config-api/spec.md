## ADDED Requirements

### Requirement: Public published site config endpoint

The API application SHALL expose `GET /api/v1/site/config` returning the **published** `SiteConfig` document only, validated against the shared schema.

#### Scenario: Published config returned

- **WHEN** a client requests `GET /api/v1/site/config` after seed or publish
- **THEN** the response status is 200 and the body matches the published site configuration

#### Scenario: Draft not exposed publicly

- **WHEN** an admin has unpublished draft changes
- **THEN** `GET /api/v1/site/config` returns the last published config, not the draft

### Requirement: Admin read site config

The API application SHALL expose `GET /api/v1/admin/site/config` returning draft, published, `updatedAt`, and `publishedAt` metadata for operator use.

#### Scenario: Admin sees both draft and published

- **WHEN** a client requests `GET /api/v1/admin/site/config`
- **THEN** the response includes both `draft` and `published` objects

### Requirement: Admin patch draft

The API application SHALL expose `PATCH /api/v1/admin/site/config/draft` accepting a partial or full site config update, merging into draft, validating with `siteConfigSchema`, and persisting draft only.

#### Scenario: Draft theme update

- **WHEN** a client PATCHes draft with updated theme primary color
- **THEN** the response status is 200, draft is updated, and published remains unchanged until publish

### Requirement: Admin publish draft

The API application SHALL expose `POST /api/v1/admin/site/config/publish` that copies the validated draft to `published`, updates `published_at`, and returns the published config.

#### Scenario: Publish promotes draft

- **WHEN** a client POSTs publish after draft changes
- **THEN** `GET /api/v1/site/config` returns the newly published configuration

### Requirement: Logo upload to server storage

The API application SHALL expose `POST /api/v1/admin/site/logo` accepting multipart image upload, validating allowed MIME types and maximum size, storing the file under a configurable `UPLOAD_DIR`, and updating the draft logo to `{ kind: "uploaded", assetId, url }` with a stable public URL path.

#### Scenario: Successful logo upload

- **WHEN** a client uploads a valid PNG within size limits
- **THEN** the response status is 200, draft logo references the uploaded asset URL, and the file is readable via the public asset route

#### Scenario: Invalid upload rejected

- **WHEN** a client uploads a disallowed file type or exceeds size limit
- **THEN** the response status is 400 and draft logo is unchanged

### Requirement: Serve uploaded site assets safely

The API application SHALL serve uploaded logo files via `GET /api/v1/site/assets/*` (or equivalent) with path traversal protection and correct `Content-Type` for images.

#### Scenario: Logo asset reachable

- **WHEN** a logo was uploaded and draft or published config references its URL
- **THEN** a GET request to that asset path returns the image bytes with a success status

### Requirement: Admin site routes unauthenticated in local dev

Site admin routes SHALL follow the same trust model as Phase 2 connector admin: unauthenticated in local single-tenant development unless a later phase adds auth.

#### Scenario: Admin site config without auth token

- **WHEN** a client calls `GET /api/v1/admin/site/config` in local dev
- **THEN** the request succeeds without an Authorization header
