#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
. ./.env

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="${1:-./backups/backup-$STAMP}"
mkdir -p "$OUT_DIR"

COMPOSE_FILES="-f docker-compose.yml"

docker compose $COMPOSE_FILES exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-movie}" "${POSTGRES_DB:-movie_streamer}" \
  > "$OUT_DIR/database.sql"

VOLUME_NAME="$(docker compose $COMPOSE_FILES volume ls -q | grep api_uploads | head -n1 || true)"
if [ -n "$VOLUME_NAME" ]; then
  docker run --rm \
    -v "${VOLUME_NAME}:/data:ro" \
    -v "$OUT_DIR:/backup" \
    alpine:3.20 \
    sh -c 'cd /data && tar czf /backup/uploads.tar.gz .'
fi

echo "Backup written to $OUT_DIR"
