## Why

Operators need the easiest path to connect third-party iframe embed players without running a separate resolver service. The platform already supports `embed` as a source kind and has connector resolve infrastructure, but there is no embed connector driver, no iframe playback on the play page, and no admin UI to configure or test embed templates after first-run setup.

## What Changes

- Add a new **`embed` connector kind** with a URL template config (`urlTemplate`, optional `sourceLabel`) and placeholder interpolation from `MediaRef` (`{id}`, `{type}`, `{season}`, `{episode}`).
- Add an **embed resolver driver** that builds per-title `kind: "embed"` sources synchronously (no HTTP call to external resolver).
- Enable **iframe embed playback** on the subscriber play page with sandboxed iframe and open-in-new-tab fallback.
- Add a **mini Admin → Sources** page for listing, creating, editing, enabling/disabling, testing, and deleting embed connectors.
- Extend **first-run setup** so "Embed template" is the default/easiest optional connector choice alongside existing HTTP and manual options.
- Wire setup and admin API validation to accept the new embed connector config shape.

**Out of scope:** Third-party provider presets, embed hostname allowlist enforcement, full connector marketplace UI, server-side fetching of embed pages, legal classification of hosts.

**Non-breaking:** Existing `demo`, `manual`, and `http` connectors continue to work unchanged. HTTP connectors may still return embed sources from external resolvers.

## Capabilities

### New Capabilities

- `embed-connector`: Embed connector config schema, URL template placeholders, and resolve driver that produces validated embed sources per `MediaRef`.
- `admin-sources-ui`: Mini admin Sources page for embed connector management and in-app test against a sample TMDB title.

### Modified Capabilities

- `shared-connector-contract`: Extend connector kind and config schemas to include `embed`.
- `play-resolve`: Add embed connector driver requirement to the resolve orchestrator.
- `source-picker-ui`: Replace embed "not supported" behavior with iframe playback for `kind: "embed"` sources.
- `site-admin-ui`: Add Admin → Sources navigation and route; extend setup optional connector step with embed template option.

## Impact

- **Shared:** `packages/shared/src/schemas/connector.ts`, `deployment-settings.ts`, exports in `index.ts`.
- **API:** New `apps/api/src/resolve/drivers/embed.ts`; orchestrator switch update; DB kind union in `schema.ts`; setup validation accepts embed.
- **Web:** New `SourcesPage`, `EmbedPlayerView`, connector API helpers in `api.ts`, `PlayPage` embed branch, `SetupPage` embed option, `AdminShell`/`App.tsx` routing.
- **Docs:** Update connector contract doc and operator quickstart with embed template examples.
- **Specs:** Delta updates to shared contract, play resolve, source picker, site admin; new embed-connector and admin-sources-ui specs.
