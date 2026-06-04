## Context

Phases 0–2 deliver a working single-tenant streaming app: TMDB catalog, play resolve with connectors, and admin connector CRUD via API. The subscriber UI still hardcodes site name (“Movie Streamer”), theme tokens in `index.css`, and a single home layout (hero + three TMDB rows) defined in API mappers. There is no site configuration persistence, no admin web UI, and no draft/publish workflow.

Phase 3 implements [docs/ROADMAP.md](../../../docs/ROADMAP.md) white-label production mode: one branded site per deployment, editable without redeploy. Decisions from exploration: logo supports external URL or server upload; admin uses draft/publish; homepage categories are curated keys (not arbitrary TMDB URLs); `/admin` shell is separate from subscriber routes; `APP_MODE` remains descriptive until Phase 5.

## Goals / Non-Goals

**Goals:**

- Shared `SiteConfig` Zod contract in `packages/shared`.
- Singleton Postgres row with `draft` and `published` JSON documents.
- Public published config; admin read/patch draft/publish; logo upload to server-local storage with safe serving.
- Web admin shell (`/admin/*`) with branding, homepage, preview, publish.
- Runtime theme via CSS variables; subscriber header from published identity.
- Layout presets `hero-rows` and `grid-first`.
- Catalog home driven by published homepage blocks mapped to supported TMDB category keys.
- Seed defaults matching current product look (draft = published on first boot).

**Non-Goals:**

- `/prototype/:preset`, vendor wizard, `APP_MODE=prototype` branching (Phase 5).
- Deploy Pack YAML import/export (Phase 4).
- Drag-drop page builder, connector admin UI (API remains sufficient).
- Admin authentication (same trust model as Phase 2 connectors).
- External object storage (S3, etc.).
- Arbitrary customer-defined TMDB endpoint URLs in homepage blocks.

## Decisions

### Source of truth: database, not YAML (Phase 3)

**Choice:** Runtime authoritative config lives in PostgreSQL (`site_config` singleton). Phase 4 may later export/import `site.config.yaml` into the same shape.

**Rationale:** “Editable without redeploy” and draft/publish require a writable store; YAML alone is awkward for admin PATCH and upload metadata.

**Alternatives:** File-only config (poor admin UX); dual-write file+DB (complexity without Phase 4 need).

### Draft / publish model

**Choice:** Admin mutations update `draft` only. `POST .../publish` copies validated draft → `published` and sets `published_at`. Subscriber UI and catalog home read **published** only. Admin preview reads **draft**.

**Rationale:** Prevents half-finished branding from reaching viewers; matches user agreement.

### Logo: discriminated union + server upload

**Choice:** `identity.logo` is `{ kind: "url", url }` or `{ kind: "uploaded", assetId, url }` where `url` is a stable public path (e.g. `/v1/site/assets/logo`). Upload writes to `UPLOAD_DIR` (env, default under API data dir); validate MIME and size; update draft logo on success.

**Rationale:** User chose URL or upload without external storage; uploaded assets must survive container restarts via mounted volume in production (Phase 4).

### Theme application

**Choice:** Published (and preview draft) config maps to CSS variables already used in `apps/web/src/index.css`. `SiteConfigProvider` sets `document.documentElement` custom properties on load/change.

**Rationale:** Existing components already use `var(--color-*)`; no build-time theme compilation.

### Layout presets

**Choice:** `templateId` enum: `hero-rows` | `grid-first`. `Home` switches between two layout components; shared `MediaCard` / row building blocks.

**Rationale:** Roadmap specifies two presets, not a page builder.

### Homepage blocks and TMDB

**Choice:** Blocks are ordered list of `{ id, label?, categoryKey }` where `categoryKey` is from a fixed allowlist in shared schema (e.g. `trending_day`, `popular_movies`, `popular_tv`, `top_rated_movies`). API maps keys to TMDB client methods. Admin UI offers multi-select/reorder from allowlist; no free-text endpoints.

**Rationale:** Security, supportability, and future provider swap (manifest) without changing admin UX shape.

**TMDB responsibility:** Customer deployment uses customer `TMDB_API_KEY`. Product docs note TMDB terms (attribution, commercial license if applicable); not enforced in code in Phase 3.

### Admin shell routes

| Route | Purpose |
|-------|---------|
| `/admin` | Redirect or hub |
| `/admin/branding` | Site name, theme, logo URL/upload |
| `/admin/homepage` | Template + category blocks |
| `/admin/preview` | Subscriber home using draft config |

Subscriber routes unchanged under `/` with separate `SubscriberShell`.

### API surface

| Route | Consumer | Returns |
|-------|----------|---------|
| `GET /v1/site/config` | Subscriber | Published `SiteConfig` |
| `GET /v1/site/assets/*` | Browser | Uploaded logo bytes (path-safe) |
| `GET /v1/admin/site/config` | Admin | `{ draft, published, updatedAt, publishedAt }` |
| `PATCH /v1/admin/site/config/draft` | Admin | Merged/validated draft |
| `POST /v1/admin/site/config/publish` | Admin | Publishes draft |
| `POST /v1/admin/site/logo` | Admin | Multipart upload → updates draft logo |

Mount under existing Hono app in `apps/api/src/index.ts`. Unauthenticated admin (Phase 2 parity).

### Migrations

**Choice:** Add `0001_site_config.sql`; extend `migrate.ts` to apply all `drizzle/*.sql` in sorted order (today only `0000` runs).

**Rationale:** Phase 3 table would never apply otherwise.

### shadcn for admin forms

**Choice:** Initialize shadcn/ui under `apps/web` for admin color inputs, selects, and block reorder (Phase 0 deferred this to Phase 3).

**Rationale:** Roadmap and architecture ADR; better admin UX than raw HTML only.

### APP_MODE

**Choice:** No behavioral branching in Phase 3; continue exposing on `/health` only.

**Rationale:** User decision; prototype differences are Phase 5.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Draft preview diverges from published catalog rows | Preview uses draft theme/layout; catalog home in preview may still call API that reads published blocks—or add optional `?useDraft=1` admin-only query for homepage preview (prefer admin preview route that passes draft block list to a preview-specific catalog call if needed). **v1:** preview focuses on theme/template/header; homepage rows in preview can use draft blocks via admin-only catalog endpoint or client-side mock—spec calls for draft homepage in preview. |
| Uploaded logos lost on container recreate | Document volume mount in Phase 4; store under persistent `UPLOAD_DIR`. |
| Partial theme tokens leave hardcoded `neutral-*` classes | Accept for v1; migrate high-visibility surfaces to CSS vars incrementally. |
| TMDB commercial misuse by customers | Document operator responsibility; no vendor key in customer packs. |
| Large logo uploads | Enforce max bytes and image MIME allowlist. |

## Migration Plan

1. Deploy migration `0001_site_config` before API that requires table.
2. Seed on startup: if no row, insert default config (draft = published).
3. Existing installs: first boot after upgrade gets defaults matching pre-Phase-3 look.
4. Rollback: revert API/web; table can remain unused; no data loss for connectors.

## Open Questions

- **Preview + catalog home:** Use `GET /v1/admin/site/preview-home` that applies draft blocks for preview only, vs. duplicating row logic client-side. **Recommendation:** admin-only endpoint returning same shape as `/catalog/home` using draft blocks.
- **Featured hero source:** Keep auto-featured from first trending item for `hero-rows` unless block config adds `showHero: false` later.
