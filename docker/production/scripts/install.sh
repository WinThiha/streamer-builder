#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker is required. Install Docker Engine and Compose plugin." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Error: docker compose plugin is required." >&2
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from template — edit DOMAIN, passwords, and SESSION_SECRET before continuing."
fi

# shellcheck disable=SC1091
. ./.env

if [ -z "${SESSION_SECRET:-}" ] || [ "$SESSION_SECRET" = "change-me-to-a-long-random-string-min-32-chars" ]; then
  if command -v openssl >/dev/null 2>&1; then
    SESSION_SECRET="$(openssl rand -hex 32)"
    echo "Generated SESSION_SECRET in .env"
    if grep -q '^SESSION_SECRET=' .env; then
      sed "s|^SESSION_SECRET=.*|SESSION_SECRET=$SESSION_SECRET|" .env > .env.tmp && mv .env.tmp .env
    else
      echo "SESSION_SECRET=$SESSION_SECRET" >> .env
    fi
  fi
fi

COMPOSE_FILES="-f docker-compose.yml"
if [ "${USE_LOCAL_BUILD:-false}" = "true" ]; then
  COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.build.yml"
fi

if [ "${USE_LOCAL_BUILD:-false}" = "true" ]; then
  docker compose $COMPOSE_FILES build api web
fi

docker compose $COMPOSE_FILES up -d

echo "Waiting for API health..."
TRIES=0
until curl -fsS "http://127.0.0.1/health" >/dev/null 2>&1 || curl -fsS "http://127.0.0.1/api/health" >/dev/null 2>&1; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -ge 60 ]; then
    echo "Timed out waiting for health. Check: docker compose logs api caddy" >&2
    exit 1
  fi
  sleep 2
done

DOMAIN="${DOMAIN:-localhost}"
echo ""
echo "Install complete."
echo "Open https://${DOMAIN}/setup to finish configuration."
echo "Health: curl -fsS https://${DOMAIN}/api/health || curl -fsS http://${DOMAIN}/api/health"
