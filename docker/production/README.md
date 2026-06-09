# Production Docker layout (Phase 4)

Customer Deploy Pack for self-hosted VPS installs: Caddy TLS, static web, API, PostgreSQL.

## Topology

```
Internet
    │
    ▼
┌─────────┐
│  Caddy  │  :443 TLS, SPA static via web, /api → API
└────┬────┘
     │
     ├──────────────▶ web (nginx + Vite build)
     │
     └──────────────▶ api :3001
                           │
                           ▼
                    ┌─────────────┐
                    │ PostgreSQL  │
                    └─────────────┘
```

## Contents

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Production stack (prebuilt images by default) |
| `docker-compose.build.yml` | Includes pack-root build override (`../../docker-compose.build.yml`) |
| `Caddyfile` | TLS, `/api` reverse proxy, SPA fallback |
| `.env.example` | Operator environment template |
| `scripts/install.sh` | First install and health wait |
| `scripts/update.sh` | Pull/recreate services |
| `scripts/backup.sh` | Postgres dump + uploads archive |
| `QUICKSTART.md` | Operator documentation |

## Usage

From this directory:

```bash
cp .env.example .env
# edit .env
chmod +x scripts/*.sh
./scripts/install.sh
```

Local build (full-source pack or dev monorepo; builds from pack/repo root):

```bash
USE_LOCAL_BUILD=true ./scripts/install.sh
```

After install, complete first-run setup at `https://YOUR_DOMAIN/setup`.

See [QUICKSTART.md](./QUICKSTART.md) and [docs/ROADMAP.md](../../docs/ROADMAP.md) Phase 4.
