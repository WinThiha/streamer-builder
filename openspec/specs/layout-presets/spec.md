# layout-presets Specification

## Purpose
TBD - created by archiving change phase-3-white-label. Update Purpose after archive.
## Requirements
### Requirement: Hero rows layout preset

When published `templateId` is `hero-rows`, the subscriber home page SHALL render a large featured hero (when configured) followed by horizontal scrolling media rows, consistent with the pre-Phase-3 home layout pattern.

#### Scenario: Hero rows template on home

- **WHEN** published config has `templateId: "hero-rows"` and the user opens `/`
- **THEN** a featured hero and horizontal catalog rows are visible

### Requirement: Grid first layout preset

When published `templateId` is `grid-first`, the subscriber home page SHALL render catalog content in a grid-first layout that de-emphasizes the large hero relative to `hero-rows` while still displaying configured homepage rows.

#### Scenario: Grid first template on home

- **WHEN** published config has `templateId: "grid-first"` and the user opens `/`
- **THEN** the home page uses a grid-oriented layout distinct from `hero-rows`

### Requirement: Template driven by published config only

The subscriber home layout selection SHALL use the **published** `templateId` from site config, not the admin draft, unless the user is on `/admin/preview`.

#### Scenario: Draft template not on public home

- **WHEN** draft `templateId` is `grid-first` and published remains `hero-rows`
- **THEN** `/` renders `hero-rows` until publish

