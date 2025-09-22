#!/bin/bash

# PostgreSQL Backup Script
# Usage: ./pg_backup.sh [--dry-run] [--compress] [--s3-upload]

set -euo pipefail

# Configuration
BACKUP_DIR="/app/backups"
DB_NAME="${POSTGRES_DB:-mechcraft}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
S3_BUCKET="${S3_BACKUP_BUCKET:-mechcraft-backups}"
S3_PREFIX="${S3_BACKUP_PREFIX:-postgresql}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Parse command line arguments
DRY_RUN=false
COMPRESS=false
S3_UPLOAD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --compress)
            COMPRESS=true
            shift
            ;;
        --s3-upload)
            S3_UPLOAD=true
            shift
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

# Create backup directory if it doesn't exist
if [[ "$DRY_RUN" == "false" ]]; then
    mkdir -p "$BACKUP_DIR"
fi

# Generate backup filename with timestamp
TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}.sql"

if [[ "$COMPRESS" == "true" ]]; then
    BACKUP_FILE="${BACKUP_FILE}.gz"
fi

log "Starting backup process..."
log "Database: $DB_NAME"
log "Host: $DB_HOST:$DB_PORT"
log "Backup file: $BACKUP_FILE"
log "Dry run: $DRY_RUN"

if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN: Would execute the following commands:"
    echo "pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    if [[ "$COMPRESS" == "true" ]]; then
        echo "| gzip > $BACKUP_FILE"
    else
        echo "> $BACKUP_FILE"
    fi
    
    if [[ "$S3_UPLOAD" == "true" ]]; then
        echo "aws s3 cp $BACKUP_FILE s3://$S3_BUCKET/$S3_PREFIX/"
    fi
    
    log "DRY RUN completed successfully"
    exit 0
fi

# Set PGPASSWORD if provided
if [[ -n "${POSTGRES_PASSWORD:-}" ]]; then
    export PGPASSWORD="$POSTGRES_PASSWORD"
fi

# Perform the backup
log "Creating database dump..."

if [[ "$COMPRESS" == "true" ]]; then
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --no-password --format=custom --compress=9 | gzip > "$BACKUP_FILE"; then
        log "Compressed backup created successfully"
    else
        error "Backup failed"
        exit 1
    fi
else
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --no-password --format=custom > "$BACKUP_FILE"; then
        log "Backup created successfully"
    else
        error "Backup failed"
        exit 1
    fi
fi

# Verify backup file
if [[ -f "$BACKUP_FILE" && -s "$BACKUP_FILE" ]]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Backup file size: $BACKUP_SIZE"
else
    error "Backup file is empty or doesn't exist"
    exit 1
fi

# Upload to S3 if requested
if [[ "$S3_UPLOAD" == "true" ]]; then
    log "Uploading backup to S3..."
    
    if command -v aws >/dev/null 2>&1; then
        S3_KEY="${S3_PREFIX}/$(basename "$BACKUP_FILE")"
        
        if aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/$S3_KEY"; then
            log "Backup uploaded to S3: s3://$S3_BUCKET/$S3_KEY"
        else
            error "S3 upload failed"
            exit 1
        fi
    else
        error "AWS CLI not found. Cannot upload to S3."
        exit 1
    fi
fi

# Clean up old backups
log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "${DB_NAME}_backup_*.sql*" -type f -mtime +$RETENTION_DAYS -delete

log "Backup process completed successfully!"

# Generate backup metadata
METADATA_FILE="${BACKUP_FILE}.meta"
cat > "$METADATA_FILE" << EOF
{
    "backup_file": "$(basename "$BACKUP_FILE")",
    "database": "$DB_NAME",
    "host": "$DB_HOST",
    "port": "$DB_PORT",
    "timestamp": "$TIMESTAMP",
    "compressed": $COMPRESS,
    "size_bytes": $(stat -c%s "$BACKUP_FILE"),
    "created_at": "$(date -Iseconds)"
}
EOF

log "Backup metadata saved to: $METADATA_FILE"
