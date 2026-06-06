## Context

The platform resolves playback sources through enabled connectors (`demo`, `manual`, `http`) and merges validated `Source` objects. The shared contract already allows `kind: "embed"`, but no connector produces embed sources today and `PlayPage` shows an explicit unsupported message. Admin connector CRUD and test endpoints exist server-side; Phase 4 deferred a full connector admin UI beyond optional first-run setup (HTTP/manual only).

Operators deploying customer sites want a paste-a-template workflow: configure an iframe URL pattern once, test against a TMDB id, and play on the subscriber site without running custom resolver middleware.

## Goals / Non-Goals

**Goals:**

- Ship a generic `embed` connector kind with URL template interpolation from `MediaRef`.
- Enable subscriber iframe playback for embed sources with sensible sandbox defaults.
- Provide a minimal Admin → Sources UI focused on embed connectors: list, create/edit, enable toggle, test, delete.
- Add embed template as the easiest optional connector in first-run setup.
- Reuse existing admin connector API and resolve orchestrator; no new persistence tables.

**Non-Goals:**

- Bundled third-party embed provider presets.
- `embedAllowlist` hostname enforcement (Phase 6).
- Full connector marketplace UI (priority drag, JSON editor, multi-kind forms).
- Server-side fetching or scraping of embed pages.
- SSRF changes to HTTP connectors.

## Decisions

### 1. New connector kind `embed` (Option A) over HTTP-only embed returns

**Choice:** Add `embed` connector with `urlTemplate` config and synchronous driver.

**Rationale:** Lowest operator friction — no separate resolver service. HTTP connector remains the escape hatch for advanced/custom logic.

**Alternatives considered:** HTTP-only (customer middleware returns embed URLs) — rejected as default UX because it requires extra infrastructure.

### 2. URL template placeholders (v1 set)

**Choice:** Support `{id}`, `{type}`, `{season}`, `{episode}` with URL-encoded substitution. TV-only placeholders resolve to empty string for movies.

**Rationale:** Matches current TMDB-centric `MediaRef` and common embed URL patterns. Small, documented surface.

**Alternatives considered:** `{provider}`, `{imdbId}` — deferred; not needed for v1 TMDB catalog.

### 3. Template validation at config time

**Choice:** Require `urlTemplate` to contain `{id}` and pass `z.string().url()` after substitution with a sample movie ref at save time (API validation).

**Rationale:** Catches typos early; avoids persisting configs that cannot produce valid URLs.

### 4. Mini Admin → Sources page (embed-focused v1)

**Choice:** New `/admin/sources` route with embed-only form in v1. List shows all connectors but edit form targets embed kind; HTTP/manual remain API/setup accessible.

**Rationale:** Fastest path to test loop (save → test → play). Avoids building full CRUD before validating embed end-to-end.

**Alternatives considered:** Extend setup only — rejected because post-setup iteration requires DB reset or curl today.

### 5. Embed playback via sandboxed iframe

**Choice:** New `EmbedPlayerView` with 16:9 iframe, `allowFullScreen`, conservative `sandbox` + `allow` attributes, and "Open in new tab" link.

**Rationale:** Standard pattern for third-party embed hosts; fallback when `X-Frame-Options` blocks iframe.

**Alternatives considered:** Shaka for embed — impossible; embed is iframe-only.

### 6. No DB migration

**Choice:** `connectors.kind` column is free text; config is jsonb validated by Zod. Extend TypeScript union and schemas only.

**Rationale:** Zero migration risk for existing deployments.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Embed host blocks iframe (`X-Frame-Options`, CSP) | Test panel shows generated URL; play page offers open-in-new-tab fallback; document limitation |
| Malformed URL templates | Config-time validation with sample interpolation; post-substitution URL schema check |
| No embed allowlist yet | Document as operator responsibility; design config shape to add `allowedHosts[]` later without breaking templates |
| Production CSP may block iframe domains | Note in QUICKSTART: may need `frame-src` in reverse proxy for customer domains |
| Spec conflict with "embed not supported" | Delta spec removes old requirement, adds iframe playback requirement |
| Mini UI scope creep | v1 form is embed-only; defer generic connector editor to later phase |

## Migration Plan

1. Deploy API + shared schema changes (backward compatible — existing connectors unaffected).
2. Deploy web with iframe player and Admin → Sources.
3. Operators create embed connectors via admin UI or setup; no data migration required.
4. Rollback: disable/delete embed connectors; revert web hides iframe branch (embed sources would show unsupported again if rolled back without schema revert).

## Open Questions

- None blocking v1. Future: `{imdbId}` placeholder, embed allowlist enforcement, generic admin connector editor.
