# Connector contract v1

Normative playback resolve contract for Movie Streamer. Zod schemas in `packages/shared` are the source of truth.

## Resolve request

`POST /api/v1/play/resolve`

```json
{
  "mediaRef": {
    "provider": "tmdb",
    "type": "movie",
    "id": "550"
  },
  "metadata": {
    "title": "Fight Club"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `mediaRef` | yes | Title identity for resolvers |
| `metadata` | no | Opaque enrichment (e.g. TMDB fields); not required in v1 |

### MediaRef

| Field | Type | Notes |
|-------|------|-------|
| `provider` | string | e.g. `tmdb` |
| `type` | `movie` \| `tv` \| `episode` | |
| `id` | string | Provider id |
| `season` | number | TV |
| `episode` | number | TV |

## Resolve response

```json
{
  "sources": [
    {
      "id": "demo-default-demo",
      "connectorId": "demo-default",
      "label": "Demo Stream",
      "kind": "hls",
      "url": "https://example.com/master.m3u8",
      "expiresAt": "2026-06-04T12:00:00.000Z",
      "subtitles": [
        { "url": "https://example.com/en.vtt", "lang": "en", "label": "English" }
      ]
    }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `sources` | yes | May be empty if no connector succeeded |

### Source

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique within resolve result |
| `connectorId` | string | Originating connector |
| `label` | string | Shown in source picker |
| `kind` | `hls` \| `progressive` \| `embed` | |
| `url` | string (URL) | Playback or embed URL |
| `expiresAt` | ISO datetime | Optional cache hint |
| `subtitles` | array | Optional VTT/WebVTT URLs |

Subscriber-facing resolve returns HTTP 200 with `{ "sources": [] }` when all connectors fail. Per-connector errors are not exposed.

## Connector kinds (platform)

Configured in admin; stored in PostgreSQL.

### demo

Built-in legal sample HLS from server env `DEMO_HLS_URL`.

```json
{
  "kind": "demo",
  "sourceLabel": "Demo Stream"
}
```

### manual

Static test sources (same URLs for every title). Used for demos and picker testing.

```json
{
  "kind": "manual",
  "sources": [
    {
      "id": "manual-1",
      "label": "Test Server A",
      "kind": "hls",
      "url": "https://example.com/a.m3u8"
    }
  ]
}
```

`connectorId` is set by the platform when resolving.

### http

Calls a customer-owned resolver.

**Request** (from platform to customer URL):

```json
{
  "mediaRef": {
    "provider": "tmdb",
    "type": "movie",
    "id": "550"
  }
}
```

**Response** (customer → platform): same shape as resolve response (`sources[]` only required).

```json
{
  "kind": "http",
  "resolveUrl": "https://resolver.customer.example/resolve",
  "timeoutMs": 10000
}
```

## Orchestration (platform behavior)

- Enabled connectors run in parallel.
- Each result is validated with the `Source` schema.
- Sources are merged, deduplicated by `url`, sorted by label, capped (20).
- Results cached in memory ~15 minutes; cache invalidated when connector config changes.

## Admin Test

`POST /api/v1/admin/connectors/:id/test`

```json
{
  "mediaRef": { "provider": "tmdb", "type": "movie", "id": "550" }
}
```

Response includes `ok`, `sources`, and optional `error` for operators.

## Security notes (v1)

- HTTP connectors can reach arbitrary URLs in local dev; SSRF validation is planned for Phase 6.
- Admin routes are unauthenticated in Phase 2 (local single-tenant only).
- Do not expose `TMDB_API_KEY` or resolver secrets to the browser.
