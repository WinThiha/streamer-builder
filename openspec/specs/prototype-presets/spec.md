# prototype-presets Specification

## Purpose
Preset registry and `/prototype/:preset` subscriber routes with shared TMDB catalog.
## Requirements
### Requirement: Preset registry exposes slugs

The shared package SHALL export a prototype preset registry mapping slug to display name and `SiteConfig` overlay.

#### Scenario: List presets

- **WHEN** `GET /v1/vendor/presets` is called
- **THEN** the response includes slug, name, and description for each preset

### Requirement: Prototype routes use preset overlay

The web app SHALL serve `/prototype/:preset/*` with subscriber UI themed by the preset overlay.

#### Scenario: Open fitness preset home

- **WHEN** a visitor navigates to `/prototype/fitness`
- **THEN** the home page uses the fitness preset theme and layout

