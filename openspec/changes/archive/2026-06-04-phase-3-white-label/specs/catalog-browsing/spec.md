## ADDED Requirements

### Requirement: Home layout from published template

The web application home page (`/`) SHALL render using the layout preset indicated by published `templateId` (`hero-rows` or `grid-first`).

#### Scenario: Template switch after publish

- **WHEN** an admin publishes a change from `hero-rows` to `grid-first`
- **THEN** the home page at `/` renders the grid-first layout without redeploying the web bundle

## MODIFIED Requirements

### Requirement: Home page displays catalog rows

The web application SHALL display TMDB browse rows on the home page (`/`), fetched from the catalog home API endpoint (which reflects **published** homepage blocks), with each item showing at least a poster image and title, using the published layout preset.

#### Scenario: Home rows visible

- **WHEN** a user opens `/` with the API and TMDB configured
- **THEN** at least one horizontal row or grid section of media items is visible with posters and titles
