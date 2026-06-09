## Context

Phases 3–4 provide `SiteConfig`, admin preview, and `docker/production/` Deploy Pack templates. `APP_MODE` exists in env but has no behavioral branching. `SetupGate` blocks all routes until customer setup completes, which prevents vendor prototype demos on a fresh DB.

## Goals / Non-Goals

**Goals:** Legal prototype presets, configure wizard, live preview, zip download matching wizard choices.

**Non-Goals:** Customer streams on vendor infra, DNS automation, preview session sharing in v1 (optional stretch).

## Decisions

### 1. Prototype mode bypasses customer setup

**Decision:** When `APP_MODE=prototype`, API seeds deployment settings as setup-complete with vendor `TMDB_API_KEY`; web `SetupGate` skips redirect to `/setup`. Only demo connector enabled.

### 2. Presets are static SiteConfig overlays

**Decision:** Preset registry in `packages/shared` maps slug → partial `SiteConfig`. `/prototype/:preset` applies overlay atop `defaultSiteConfig` via context provider without DB writes.

### 3. Wizard uses client-held draft

**Decision:** `/configure` stores wizard state in React context/localStorage. Preview renders draft in scoped frame (reuse admin PreviewPage pattern). Pack generation POST sends wizard payload to API.

### 4. Pack generator copies templates

**Decision:** API reads `docker/production/`, substitutes `.env` secrets/domain, writes `site.config.yaml` from wizard `SiteConfig`, returns `application/zip`. No vendor TMDB key in pack.

## Risks

- Setup gate must be mode-aware on web and API.
- Logo uploads in wizard: use URL kind only in v1 pack generation.
