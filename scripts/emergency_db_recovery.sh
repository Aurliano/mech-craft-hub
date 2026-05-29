#!/bin/bash
# Phase 0: Emergency data recovery attempts before switching to local PostgreSQL on Liara disk.
# Run these steps from Liara shell or locally with Liara CLI before deploying the new setup.
#
# Usage:
#   liara shell --app mech-craft-hub-main
#   bash /app/scripts/emergency_db_recovery.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[recovery]${NC} $1"; }
warn() { echo -e "${YELLOW}[recovery]${NC} $1"; }
err() { echo -e "${RED}[recovery]${NC} $1"; }

BACKUP_DIR="${BACKUP_DIR:-/app/backups}"
mkdir -p "$BACKUP_DIR"

log "=== Phase 0: Emergency database recovery ==="
echo ""
warn "Preferred: run dedicated legacy backup script:"
echo "  bash /app/scripts/backup_legacy_sayda_db.sh"
echo ""
warn "Manual checks (Liara panel):"
echo "  1. PostgreSQL service (sayda-db) -> Snapshots / Export / Backups"
echo "  2. Check /app/backend/media for db.sqlite3 or *.json exports"
echo ""

if [[ -x /app/scripts/backup_legacy_sayda_db.sh ]]; then
  log "Running backup_legacy_sayda_db.sh..."
  if bash /app/scripts/backup_legacy_sayda_db.sh; then
    exit 0
  fi
  err "backup_legacy_sayda_db.sh failed; trying inline pg_dump..."
fi

# Fallback inline pg_dump
LEGACY_HOST="${LEGACY_DB_HOST:-sayda-db}"
LEGACY_USER="${LEGACY_DB_USER:-root}"
LEGACY_DB="${LEGACY_DB_NAME:-postgres}"
EMERGENCY_DUMP="${BACKUP_DIR}/emergency.dump"

log "Attempting pg_dump from legacy host: ${LEGACY_HOST}..."
if command -v pg_dump >/dev/null 2>&1; then
  if pg_dump -h "$LEGACY_HOST" -p "${LEGACY_DB_PORT:-5432}" -U "$LEGACY_USER" -d "$LEGACY_DB" -Fc -f "$EMERGENCY_DUMP" 2>/dev/null; then
    log "SUCCESS: Emergency dump saved to ${EMERGENCY_DUMP}"
    log "Set RESTORE_DUMP=${EMERGENCY_DUMP} before next deploy to auto-restore."
    exit 0
  else
    err "pg_dump failed - legacy database may be unreachable."
  fi
else
  warn "pg_dump not available in this environment."
fi

# Search media disk for SQLite or JSON backups
log "Searching media disk for local database files..."
find /app/backend/media -maxdepth 4 \( -name 'db.sqlite3' -o -name '*.sql' -o -name '*.sql.gz' -o -name '*backup*.json' \) 2>/dev/null | while read -r f; do
  warn "Found: $f"
done

log "Phase 0 complete. If no dump was created, deploy will start with empty schema + migrations."
log "Upload any external dump to ${BACKUP_DIR}/emergency.dump and set RESTORE_DUMP=/app/backups/emergency.dump"
