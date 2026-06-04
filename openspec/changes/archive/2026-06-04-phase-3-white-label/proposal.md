## Why

Phase 2 delivers multi-source playback and connector admin via API, but the product still looks like a single hardcoded demo site: fixed name, colors, homepage rows, and one layout. Phase 3 is the shift from “streaming app” to “configurable white-label product”: customers rebrand and reshape the subscriber experience from admin without redeploying code. That unlocks Phase 4 (Deploy Pack) and Phase 5 (vendor prototype/wizard), which both assume a runtime site identity layer exists.

## What Changes

- Add shared `SiteConfig` Zod contract: identity (site name, logo as URL or server upload), theme tokens, `templateId`, and ordered homepage blocks backed by curated category keys.
- Persist site configuration in PostgreSQL as a singleton with **draft** and **published** documents; admin edits draft only until publish.
- Add public `GET /v1/site/config` (published only) and admin site routes: read draft/published, patch draft, publish, and logo upload with server-local asset storage and safe serving.
- Add `/admin` web shell: branding, homepage configuration, draft preview, and publish workflow.
- Apply published theme at runtime via CSS variables; render site name/logo in subscriber header.
- Implement two homepage layout presets: `hero-rows` (current behavior) and `grid-first`.
- Drive `GET /v1/catalog/home` from **published** homepage blocks mapped to supported TMDB category keys (customer’s `TMDB_API_KEY`; no vendor key in customer packs).
- Seed defaults matching today’s look so fresh installs work before first admin visit.

**Out of scope:** `/prototype/:preset` and `APP_MODE=prototype` behavior (Phase 5), Deploy Pack / `site.config.yaml` import-export (Phase 4), drag-drop page builder, connector marketplace, admin authentication hardening, external object storage (S3, etc.), arbitrary customer-defined TMDB endpoint URLs.

**Non-breaking:** Existing catalog, play resolve, connector admin, and browse/detail routes remain; homepage shape may change only when published config differs from today’s implicit defaults.

## Capabilities

### New Capabilities

- `site-config-contract`: Shared Zod schemas for `SiteConfig`, logo discriminant, theme tokens, `templateId`, homepage blocks, and supported category keys.
- `site-config-persistence`: Singleton `site_config` table, migrations, repository, and idempotent seed (draft = published on first boot).
- `site-config-api`: Public published config endpoint; admin draft/patch/publish; logo upload and asset serving from server storage.
- `site-admin-ui`: `/admin` shell with branding, homepage, preview (draft), and publish UX.
- `layout-presets`: Subscriber home renders `hero-rows` or `grid-first` from published `templateId`.
- `configurable-homepage`: Catalog home API builds rows from published homepage blocks and allowed TMDB category keys.

### Modified Capabilities

- `web-foundation`: Split subscriber vs admin route trees; site config provider; runtime theming; header branding from config.
- `api-foundation`: Mount `/v1/site` and `/v1/admin/site` route groups; optional upload directory env.
- `catalog-browsing`: Home page layout selection and row content driven by published site config (not hardcoded three rows).
- `tmdb-catalog-api`: Map supported homepage block keys to existing TMDB client calls (extend client only as needed for new keys like `top_rated_movies`).

## Impact

- **Shared:** New `packages/shared/src/schemas/site-config.ts` and exports.
- **API:** New `site_config` table, migration `0001`, extended migration runner, repository/seed, site routes, multipart logo handling, catalog mapper refactor.
- **Web:** `AdminShell`, admin pages, `SiteConfigProvider`, subscriber shell refactor, two home layouts, preview route.
- **Docs:** `docs/ROADMAP.md` Phase 3 alignment; architecture notes for draft/publish and TMDB customer-key responsibility.
- **Downstream:** Phase 4 can export/import `site.config.yaml` from DB; Phase 5 reuses config model for prototype presets. `APP_MODE` stays descriptive until Phase 5.
