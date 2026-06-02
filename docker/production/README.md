# Production Docker layout (Phase 4)

Phase 0 does not implement the customer Deploy Pack. This folder documents the target production topology.

## Target services

```
Internet
    │
    ▼
┌─────────┐
│  Caddy  │  :443 TLS, static web, /api → API
└────┬────┘
     │
     ├──────────────▶ web (static build from apps/web)
     │
     └──────────────▶ api :3001
                           │
                           ▼
                    ┌─────────────┐
                    │ PostgreSQL  │
                    └─────────────┘
```

## Planned contents (Phase 4)

- `docker-compose.yml` for customer VPS
- `Caddyfile` with domain from `.env`
- `install.sh`, `update.sh`, healthchecks
- Generated `site.config.yaml` and secrets in Deploy Pack

See [docs/ROADMAP.md](../../docs/ROADMAP.md) Phase 4.
