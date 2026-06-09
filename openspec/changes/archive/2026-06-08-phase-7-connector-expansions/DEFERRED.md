# Deferred Phase 7 modules

These optional expansions are documented for future epics. They are intentionally out of scope for the current parallel implementation push.

## Custom domain automation in wizard

- DNS verification API, ACME preflight, and registrar integration.
- **Prerequisite:** Phase 5 configure wizard and pack generator stable.

## Source health / scoring

- Persist resolve outcomes, rank connectors by success rate and latency.
- **Prerequisite:** Phase 6 admin resolve diagnostics and migration ledger.

## Upload + transcode worker

- ffmpeg queue, media library admin, HLS output volumes, backup implications.
- **Prerequisite:** Phase 6 URL/file validation and operator scripts.

## Full catalog manifest provider

- Replace TMDB browse with static manifest-driven catalog and search.
- **Prerequisite:** Playback-only manifest connector proven useful in production.

## Bunny / Vimeo adapters

- Form-based vendor connectors (deferred from low-risk batch; can be added incrementally).
