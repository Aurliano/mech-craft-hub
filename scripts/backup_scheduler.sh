#!/bin/bash
# Daily PostgreSQL backup to persistent disk, with optional S3 upload.
set -euo pipefail

BACKUP_INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}"
BACKUP_DIR="${BACKUP_DIR:-/app/backups}"
S3_UPLOAD="${S3_UPLOAD:-0}"

export POSTGRES_HOST="${POSTGRES_HOST:-127.0.0.1}"
export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
export POSTGRES_DB="${POSTGRES_DB:-mechcraft}"
export POSTGRES_USER="${POSTGRES_USER:-mechcraft}"

mkdir -p "$BACKUP_DIR"

log() { echo "[backup-scheduler $(date -Iseconds)] $1"; }

run_backup() {
  local args=(backup_db --compress --backup-dir "$BACKUP_DIR")
  if [ "$S3_UPLOAD" = "1" ]; then
    args+=(--s3-upload)
  fi
  log "Running manage.py ${args[*]}"
  (cd /app/backend && python manage.py "${args[@]}")
}

log "Scheduler started (interval=${BACKUP_INTERVAL_SECONDS}s, s3=${S3_UPLOAD})"

while true; do
  run_backup || log "Backup failed; will retry on next interval."
  sleep "$BACKUP_INTERVAL_SECONDS"
done
