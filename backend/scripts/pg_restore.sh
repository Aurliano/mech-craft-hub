#!/bin/bash

# PostgreSQL Restore Script
# Usage: ./pg_restore.sh <backup_file> [--dry-run] [--drop-db] [--create-db]

set -euo pipefail

# Configuration
DB_NAME="${POSTGRES_DB:-mechcraft}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
TEMP_DB_NAME="${DB_NAME}_restore_temp"

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
BACKUP_FILE=""
DRY_RUN=false
DROP_DB=false
CREATE_DB=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --drop-db)
            DROP_DB=true
            shift
            ;;
        --create-db)
            CREATE_DB=true
            shift
            ;;
        -*)
            echo "Unknown option $1"
            exit 1
            ;;
        *)
            if [[ -z "$BACKUP_FILE" ]]; then
                BACKUP_FILE="$1"
            else
                echo "Multiple backup files specified"
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate backup file
if [[ -z "$BACKUP_FILE" ]]; then
    error "Backup file is required"
    echo "Usage: $0 <backup_file> [--dry-run] [--drop-db] [--create-db]"
    exit 1
fi

# Check if backup file exists
if [[ ! -f "$BACKUP_FILE" ]]; then
    error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Check if backup file is not empty
if [[ ! -s "$BACKUP_FILE" ]]; then
    error "Backup file is empty: $BACKUP_FILE"
    exit 1
fi

log "Starting restore process..."
log "Backup file: $BACKUP_FILE"
log "Target database: $DB_NAME"
log "Host: $DB_HOST:$DB_PORT"
log "Dry run: $DRY_RUN"

# Set PGPASSWORD if provided
if [[ -n "${POSTGRES_PASSWORD:-}" ]]; then
    export PGPASSWORD="$POSTGRES_PASSWORD"
fi

# Test database connection
log "Testing database connection..."
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
    error "Cannot connect to PostgreSQL server"
    exit 1
fi

if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN: Would execute the following commands:"
    
    if [[ "$DROP_DB" == "true" ]]; then
        echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c \"DROP DATABASE IF EXISTS $DB_NAME;\""
    fi
    
    if [[ "$CREATE_DB" == "true" ]]; then
        echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c \"CREATE DATABASE $DB_NAME;\""
    fi
    
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        echo "gunzip -c $BACKUP_FILE | pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --verbose --clean --if-exists"
    else
        echo "pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --verbose --clean --if-exists $BACKUP_FILE"
    fi
    
    log "DRY RUN completed successfully"
    exit 0
fi

# Create backup of current database if it exists
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    warn "Database $DB_NAME already exists"
    
    if [[ "$DROP_DB" == "true" ]]; then
        log "Dropping existing database..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE $DB_NAME;"
    else
        # Create temporary backup
        BACKUP_TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
        CURRENT_BACKUP="${BACKUP_FILE%.*}_current_${BACKUP_TIMESTAMP}.sql"
        
        log "Creating backup of current database to: $CURRENT_BACKUP"
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --format=custom > "$CURRENT_BACKUP"
    fi
fi

# Create database if it doesn't exist
if [[ "$CREATE_DB" == "true" ]] || ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    log "Creating database $DB_NAME..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"
fi

# Restore the database
log "Restoring database from backup..."

if [[ "$BACKUP_FILE" == *.gz ]]; then
    if gunzip -c "$BACKUP_FILE" | pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --verbose --clean --if-exists; then
        log "Compressed backup restored successfully"
    else
        error "Restore failed"
        exit 1
    fi
else
    if pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --verbose --clean --if-exists "$BACKUP_FILE"; then
        log "Backup restored successfully"
    else
        error "Restore failed"
        exit 1
    fi
fi

# Verify restore
log "Verifying restore..."
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [[ "$TABLE_COUNT" -gt 0 ]]; then
    log "Restore verification successful. Found $TABLE_COUNT tables in the database."
else
    warn "No tables found in restored database. This might indicate an issue with the restore."
fi

log "Restore process completed successfully!"

# Cleanup temporary database if created
if [[ "$DROP_DB" == "true" && -n "${CURRENT_BACKUP:-}" ]]; then
    log "Cleaning up temporary backup: $CURRENT_BACKUP"
    rm -f "$CURRENT_BACKUP"
fi
