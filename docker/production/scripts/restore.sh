#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROD_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROD_DIR}"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <backup-archive.tar.gz>"
  echo "Restores Postgres dump and uploads from a backup created by backup.sh"
  exit 1
fi

ARCHIVE="$1"
if [[ ! -f "${ARCHIVE}" ]]; then
  echo "Backup file not found: ${ARCHIVE}"
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Missing .env in ${PROD_DIR}. Copy .env.example first."
  exit 1
fi

# shellcheck disable=SC1091
source .env

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "${WORK_DIR}"' EXIT

tar -xzf "${ARCHIVE}" -C "${WORK_DIR}"

DUMP_FILE="$(find "${WORK_DIR}" -name '*.sql' | head -n 1 || true)"
UPLOADS_ARCHIVE="$(find "${WORK_DIR}" -name 'uploads.tar.gz' | head -n 1 || true)"

if [[ -z "${DUMP_FILE}" ]]; then
  echo "No SQL dump found in backup archive."
  exit 1
fi

echo "Stopping API to release DB connections..."
docker compose stop api || true

echo "Restoring database..."
docker compose exec -T postgres psql -U "${POSTGRES_USER:-movie}" -d "${POSTGRES_DB:-movie_streamer}" < "${DUMP_FILE}"

if [[ -n "${UPLOADS_ARCHIVE}" ]]; then
  echo "Restoring uploads volume..."
  docker compose run --rm -v api_uploads:/data/uploads api sh -c "rm -rf /data/uploads/* && tar -xzf - -C /data/uploads" < "${UPLOADS_ARCHIVE}"
fi

echo "Starting stack..."
docker compose up -d

echo "Restore complete. Verify health at https://${DOMAIN}/api/health"
