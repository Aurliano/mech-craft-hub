#!/bin/bash
# Backup legacy Liara managed PostgreSQL (sayda-db) before switching to local Postgres.
# Run INSIDE Liara shell (sayda-db is only reachable on the private network):
#   liara shell --app mech-craft-hub-main
#   bash /app/scripts/backup_legacy_sayda_db.sh
#
# Or from Liara web console terminal on the running app.

set -euo pipefail

LEGACY_HOST="${LEGACY_DB_HOST:-sayda-db}"
LEGACY_PORT="${LEGACY_DB_PORT:-5432}"
LEGACY_USER="${LEGACY_DB_USER:-root}"
LEGACY_DB="${LEGACY_DB_NAME:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-/app/backups}"
OUTPUT_FILE="${OUTPUT_FILE:-${BACKUP_DIR}/emergency.dump}"

# Password: LEGACY_DB_PASSWORD, PGPASSWORD, or parse from DATABASE_URL
if [[ -z "${LEGACY_DB_PASSWORD:-}" && -n "${DATABASE_URL:-}" ]]; then
  LEGACY_DB_PASSWORD="$(python3 - <<'PY'
import os
from urllib.parse import urlparse
u = urlparse(os.environ["DATABASE_URL"])
print(u.password or "")
PY
)"
fi

if [[ -z "${LEGACY_DB_PASSWORD:-}" && -z "${PGPASSWORD:-}" ]]; then
  echo "Set LEGACY_DB_PASSWORD or DATABASE_URL or PGPASSWORD, then re-run." >&2
  exit 1
fi

export PGPASSWORD="${LEGACY_DB_PASSWORD:-$PGPASSWORD}"

mkdir -p "$BACKUP_DIR"

log() { echo "[backup-legacy] $1"; }

log "Source: ${LEGACY_USER}@${LEGACY_HOST}:${LEGACY_PORT}/${LEGACY_DB}"
log "Target: ${OUTPUT_FILE}"

if command -v pg_dump >/dev/null 2>&1; then
  log "Using pg_dump..."
  pg_dump -h "$LEGACY_HOST" -p "$LEGACY_PORT" -U "$LEGACY_USER" -d "$LEGACY_DB" \
    -Fc --verbose -f "$OUTPUT_FILE"
elif [[ -f /app/backend/manage.py ]]; then
  log "pg_dump not found; using Django backup_db..."
  export DATABASE_URL="postgresql://${LEGACY_USER}:${PGPASSWORD}@${LEGACY_HOST}:${LEGACY_PORT}/${LEGACY_DB}"
  STAMP="$(date +%Y%m%d_%H%M%S)"
  (cd /app/backend && python manage.py backup_db --compress --backup-dir "$BACKUP_DIR")
  LATEST="$(ls -t "${BACKUP_DIR}"/*_backup_*.sql.gz 2>/dev/null | head -1)"
  if [[ -z "$LATEST" ]]; then
    echo "Django backup_db produced no file." >&2
    exit 1
  fi
  cp "$LATEST" "${OUTPUT_FILE}.gz"
  OUTPUT_FILE="${OUTPUT_FILE}.gz"
else
  echo "Neither pg_dump nor Django manage.py available." >&2
  exit 1
fi

if [[ ! -s "$OUTPUT_FILE" ]]; then
  echo "Backup file missing or empty: $OUTPUT_FILE" >&2
  exit 1
fi

SIZE="$(du -h "$OUTPUT_FILE" | cut -f1)"
log "SUCCESS: backup size ${SIZE}"
log "Set in Liara env for first boot: RESTORE_DUMP=${OUTPUT_FILE}"

# Quick sanity check
if command -v pg_restore >/dev/null 2>&1 && [[ "$OUTPUT_FILE" == *.dump ]]; then
  TABLE_COUNT="$(pg_restore -l "$OUTPUT_FILE" 2>/dev/null | grep -c 'TABLE DATA' || true)"
  log "Approximate TABLE DATA entries in dump: ${TABLE_COUNT}"
fi
