# site-config-contract Specification

## Purpose
TBD - created by archiving change phase-3-white-label. Update Purpose after archive.
## Requirements
### Requirement: SiteConfig schema exported from shared package

The `@movie-streamer/shared` package SHALL export a Zod-validated `SiteConfig` schema and inferred TypeScript type used by API and web for site branding and layout configuration.

#### Scenario: Valid site config parses

- **WHEN** a JSON document matches the `SiteConfig` schema (identity, theme, templateId, homepage blocks)
- **THEN** `siteConfigSchema.parse` succeeds and returns a typed `SiteConfig` object

#### Scenario: Invalid site config rejected

- **WHEN** a document omits required fields or uses an unknown `templateId`
- **THEN** parsing fails with a validation error

### Requirement: Logo discriminated union

The `SiteConfig` identity SHALL include a `logo` field that is either `{ kind: "url", url: string }` or `{ kind: "uploaded", assetId: string, url: string }` where `url` is a public path or absolute URL suitable for `<img src>`.

#### Scenario: External URL logo

- **WHEN** logo is `{ kind: "url", url: "https://example.com/logo.png" }`
- **THEN** the config is valid

#### Scenario: Uploaded logo reference

- **WHEN** logo is `{ kind: "uploaded", assetId: "logo", url: "/v1/site/assets/logo" }`
- **THEN** the config is valid

### Requirement: Theme tokens align with web CSS variables

The `SiteConfig` theme object SHALL include string values for at least `background`, `foreground`, `primary`, `muted`, and `surface` suitable for mapping to the subscriber app CSS variables.

#### Scenario: Theme tokens present

- **WHEN** a complete `SiteConfig` is validated
- **THEN** the theme object contains all required color token fields

### Requirement: Template identifier enum

The `SiteConfig` SHALL include `templateId` with allowed values `hero-rows` and `grid-first` only.

#### Scenario: Hero rows template

- **WHEN** `templateId` is `hero-rows`
- **THEN** validation succeeds

#### Scenario: Unknown template rejected

- **WHEN** `templateId` is `sidebar-nav`
- **THEN** validation fails

### Requirement: Homepage blocks use curated category keys

The `SiteConfig` homepage SHALL define an ordered list of blocks where each block references a `categoryKey` from a fixed allowlist defined in shared (e.g. `trending_day`, `popular_movies`, `popular_tv`, `top_rated_movies`). Arbitrary TMDB URLs or path strings SHALL NOT be accepted in `categoryKey`.

#### Scenario: Allowed category key

- **WHEN** a block uses `categoryKey: "popular_movies"`
- **THEN** validation succeeds

#### Scenario: Disallowed category key

- **WHEN** a block uses `categoryKey: "https://api.themoviedb.org/3/movie/popular"`
- **THEN** validation fails

### Requirement: Default site config constant

The shared package SHALL export a `defaultSiteConfig` constant matching the pre-Phase-3 product defaults (site name, theme colors, `hero-rows`, and default homepage blocks).

#### Scenario: Default config validates

- **WHEN** `defaultSiteConfig` is parsed with `siteConfigSchema`
- **THEN** parsing succeeds

