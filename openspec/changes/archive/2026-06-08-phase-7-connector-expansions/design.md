## Context

Admin uses shadcn components with separate oklch CSS vars from site `--color-*` tokens. Orchestrator always merges all connector results. Connector kinds: demo, manual, http, embed.

## Goals / Non-Goals

**Goals:** Theme bridge, resolve mode, playback manifest connector, deferred module plan.

**Non-Goals:** Upload/transcode, full catalog manifest, DNS automation, health scoring.

## Decisions

### 1. shadcn bridge maps hex → oklch approximations

**Decision:** `applyShadcnTheme(theme, element)` sets `--primary`, `--background`, etc. on admin root only.

### 2. connectorResolveMode on SiteConfig

**Decision:** `playback.connectorResolveMode: 'show-all' | 'first-good'`. First-good stops after first fulfilled connector with sources, ordered by priority.

### 3. Manifest connector (playback only)

**Decision:** `manifest` kind with `manifestUrl` pointing to JSON `{ entries: [{ mediaRef, sources }] }`. Lookup by mediaRef key; no browse integration.

### 4. Deferred modules documented in tasks

**Decision:** Separate task section documents future epics without implementation.
