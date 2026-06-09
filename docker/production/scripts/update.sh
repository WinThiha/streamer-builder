#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

echo "Tip: run ./scripts/backup.sh before updating production."

COMPOSE_FILES="-f docker-compose.yml"
if [ "${USE_LOCAL_BUILD:-false}" = "true" ]; then
  COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.build.yml"
fi

if [ "${USE_LOCAL_BUILD:-false}" = "true" ]; then
  docker compose $COMPOSE_FILES build api web
else
  docker compose $COMPOSE_FILES pull api web || true
fi
docker compose $COMPOSE_FILES up -d --force-recreate api web caddy

echo "Waiting for API health..."
TRIES=0
until curl -fsS "http://127.0.0.1/api/health" >/dev/null 2>&1; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -ge 60 ]; then
    echo "Timed out waiting for health." >&2
    exit 1
  fi
  sleep 2
done

echo "Update complete."
