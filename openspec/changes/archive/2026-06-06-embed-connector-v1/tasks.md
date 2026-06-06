## 1. Shared schema

- [x] 1.1 Add `embed` to `connectorKindSchema` and `embedConnectorConfigSchema` (`urlTemplate`, optional `sourceLabel`) in `packages/shared/src/schemas/connector.ts`
- [x] 1.2 Extend `connectorConfigSchema` discriminated union with embed branch; export `EmbedConnectorConfig` type
- [x] 1.3 Update `validateSetupConnectorConfig` in `deployment-settings.ts` to validate embed configs
- [x] 1.4 Rebuild shared package (`pnpm --filter @movie-streamer/shared build`)

## 2. API embed driver

- [x] 2.1 Add `apps/api/src/resolve/drivers/embed.ts` with placeholder interpolation and `sourceSchema` validation
- [x] 2.2 Wire `embed` case in `apps/api/src/resolve/orchestrator.ts` resolve and test paths
- [x] 2.3 Extend `connectors.kind` TypeScript union in `apps/api/src/db/schema.ts` to include `embed`
- [x] 2.4 Add config-time template validation in admin connector create/update (sample movie ref interpolation + URL check)

## 3. Web API client

- [x] 3.1 Add connector types and admin API helpers in `apps/web/src/lib/api.ts` (list, create, patch, delete, test)
- [x] 3.2 Extend `SetupCompletePayload` to include `embed` connector kind

## 4. Embed playback

- [x] 4.1 Create `apps/web/src/components/EmbedPlayerView.tsx` (sandboxed iframe, 16:9, open-in-new-tab link)
- [x] 4.2 Update `PlayPage.tsx` to render `EmbedPlayerView` for `kind: "embed"`; remove unsupported message
- [x] 4.3 Show source label/kind when only one embed source (picker hidden)

## 5. Admin Sources UI

- [x] 5.1 Create `apps/web/src/pages/admin/SourcesPage.tsx` with connector list, embed form, test panel, delete
- [x] 5.2 Add `/admin/sources` route in `App.tsx` and Sources nav link in `AdminShell.tsx`
- [x] 5.3 Wire save/create/update/delete/test mutations with query invalidation and error display

## 6. Setup wizard

- [x] 6.1 Add embed template as default connector kind option in `SetupPage.tsx` with urlTemplate field and helper text
- [x] 6.2 Submit embed config in setup complete payload when optional connector enabled

## 7. Documentation

- [x] 7.1 Update `docs/connector-contract-v1.md` with embed connector kind and placeholder reference
- [x] 7.2 Add embed template curl/browser examples to `docker/production/QUICKSTART.md`

## 8. Verification

- [x] 8.1 Run `openspec validate embed-connector-v1 --strict`
- [x] 8.2 Run `pnpm typecheck` and `pnpm lint`
- [x] 8.3 API smoke test: create embed connector, test with movie and TV mediaRef, verify `/v1/play/resolve`
- [x] 8.4 Browser smoke test: Admin → Sources save/test → browse title → Play iframe (or new-tab fallback)
