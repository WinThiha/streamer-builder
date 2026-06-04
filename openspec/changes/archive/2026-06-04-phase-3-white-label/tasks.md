## 1. Shared site config contract

- [x] 1.1 Add `site-config.ts` Zod schemas (identity, logo union, theme, templateId, homepage blocks, category allowlist)
- [x] 1.2 Export `defaultSiteConfig`, types, and category allowlist from `packages/shared/src/index.ts`
- [x] 1.3 Rebuild shared package and verify API/web compile

## 2. Database and site config persistence

- [x] 2.1 Add `site_config` Drizzle schema (singleton id, draft/published jsonb, timestamps)
- [x] 2.2 Add `drizzle/0001_site_config.sql` and update migrate runner to apply all SQL files in order
- [x] 2.3 Implement site config repository (get published, get admin pair, patch draft, publish)
- [x] 2.4 Add idempotent seed using `defaultSiteConfig` (draft = published on first boot)
- [x] 2.5 Wire seed into API bootstrap and `db:seed` CLI

## 3. Site config API and logo assets

- [x] 3.1 Add `UPLOAD_DIR` and max logo size to env validation and `.env.example`
- [x] 3.2 Implement `GET /v1/site/config` (published only)
- [x] 3.3 Implement admin routes: GET config, PATCH draft, POST publish
- [x] 3.4 Implement `POST /v1/admin/site/logo` multipart upload and draft logo update
- [x] 3.5 Implement `GET /v1/site/assets/*` with path-safe file serving
- [x] 3.6 Mount site and admin site routes in `apps/api/src/index.ts`

## 4. Configurable catalog home

- [x] 4.1 Add TMDB client methods for any missing category keys (e.g. top rated)
- [x] 4.2 Refactor catalog mappers to build home rows from published homepage blocks
- [x] 4.3 Implement `GET /v1/admin/site/preview-home` using draft blocks
- [x] 4.4 Verify home row order and labels match published vs preview endpoints

## 5. Web runtime config and subscriber shell

- [x] 5.1 Add `SiteConfigProvider` and `fetchSiteConfig` in web API helpers
- [x] 5.2 Apply published theme tokens to CSS variables on load
- [x] 5.3 Extract `SubscriberShell` with dynamic site name and logo from published config
- [x] 5.4 Refactor `App.tsx` route tree (subscriber vs admin shells)

## 6. Layout presets

- [x] 6.1 Extract current home into `HomeHeroRowsLayout`
- [x] 6.2 Implement `HomeGridFirstLayout` for `grid-first` template
- [x] 6.3 Switch `Home.tsx` on published `templateId`; support draft template in preview only

## 7. Admin shell UI

- [x] 7.1 Initialize shadcn/ui (or minimal admin form components) under `apps/web`
- [x] 7.2 Add `AdminShell` with nav, draft status, publish action, and link to `/`
- [x] 7.3 Build `/admin/branding` (site name, theme colors, logo URL vs upload)
- [x] 7.4 Build `/admin/homepage` (template picker, category block multi-select/reorder)
- [x] 7.5 Build `/admin/preview` using draft config and preview-home API
- [x] 7.6 Invalidate site config and catalog queries on publish

## 8. Documentation and verification

- [x] 8.1 Update `docs/architecture.md` and README for site config, draft/publish, logo upload, admin routes
- [x] 8.2 Document TMDB customer-key and attribution responsibility for operators
- [x] 8.3 Run `pnpm typecheck` and `pnpm lint`
- [x] 8.4 Manual: draft branding does not change `/` until publish
- [x] 8.5 Manual: preview shows draft; publish updates subscriber theme/layout/logo
- [x] 8.6 Manual: homepage block changes affect catalog home after publish
- [x] 8.7 Manual: existing play resolve and connector admin still work
