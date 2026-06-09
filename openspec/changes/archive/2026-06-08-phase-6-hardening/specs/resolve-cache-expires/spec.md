## ADDED Requirements

### Requirement: Cache TTL honors source expiresAt

Resolve cache entry TTL SHALL be the minimum of the default TTL and the nearest source `expiresAt` minus a 60-second buffer.

#### Scenario: Short-lived source

- **WHEN** a resolved source has `expiresAt` 5 minutes from now
- **THEN** the cache entry expires before the source URL expires
