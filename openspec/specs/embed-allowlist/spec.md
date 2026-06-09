# embed-allowlist Specification

## Purpose
Per-site embed hostname allowlist enforced during resolve.
## Requirements
### Requirement: Embed allowlist enforcement

When `playback.embedAllowlist` is non-empty, embed source URLs SHALL only be returned if the hostname is in the allowlist.

#### Scenario: Blocked embed host

- **WHEN** embed resolves to `https://blocked.example/embed` and allowlist is `["allowed.example"]`
- **THEN** the embed source is omitted from resolve results

