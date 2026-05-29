#!/bin/bash
# Liara startup: local PostgreSQL on persistent disk + Django migrate + Gunicorn
set -euo pipefail

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
POSTGRES_DB="${POSTGRES_DB:-mechcraft}"
POSTGRES_USER="${POSTGRES_USER:-mechcraft}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD environment variable is required}"
POSTGRES_HOST="${POSTGRES_HOST:-127.0.0.1}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-/app/backups}"
RESTORE_DUMP="${RESTORE_DUMP:-/app/backups/emergency.dump}"
AUTO_BACKUP="${AUTO_BACKUP:-1}"

export POSTGRES_HOST POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD
export PGPASSWORD="$POSTGRES_PASSWORD"

log() { echo "[startup] $1"; }

ensure_postgres_user() {
  if ! id postgres &>/dev/null; then
    useradd -r -s /bin/bash -d /var/lib/postgresql postgres
  fi
}

mkdir -p "$PGDATA" "$BACKUP_DIR"
ensure_postgres_user
chown -R postgres:postgres "$PGDATA" "$BACKUP_DIR"
chmod 700 "$PGDATA"

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  log "Initializing PostgreSQL cluster in ${PGDATA}..."
  su - postgres -c "initdb -D '${PGDATA}' --auth-local=trust --auth-host=scram-sha-256"

  {
    echo "host all all 127.0.0.1/32 scram-sha-256"
    echo "host all all ::1/128 scram-sha-256"
  } >> "$PGDATA/pg_hba.conf"

  su - postgres -c "pg_ctl -D '${PGDATA}' -o \"-c listen_addresses='localhost' -c port=${POSTGRES_PORT}\" -w start"

  su - postgres -c "psql -v ON_ERROR_STOP=1 --username postgres <<EOSQL
CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';
CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};
GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
\\c ${POSTGRES_DB}
GRANT ALL ON SCHEMA public TO ${POSTGRES_USER};
EOSQL"

  su - postgres -c "pg_ctl -D '${PGDATA}' -m fast -w stop"
fi

log "Starting PostgreSQL..."
su - postgres -c "pg_ctl -D '${PGDATA}' -o \"-c listen_addresses='localhost' -c port=${POSTGRES_PORT}\" -w start"

wait_for_postgres() {
  local attempts=0
  until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 30 ]; then
      echo "PostgreSQL did not become ready in time" >&2
      exit 1
    fi
    sleep 1
  done
}

wait_for_postgres

RESTORE_MARKER="${PGDATA}/.restore_completed"
if [ -f "$RESTORE_DUMP" ] && [ ! -f "$RESTORE_MARKER" ]; then
  log "Restoring database from ${RESTORE_DUMP}..."
  if bash /app/backend/scripts/pg_restore.sh "$RESTORE_DUMP" --drop-db --create-db; then
    touch "$RESTORE_MARKER"
    log "Restore completed."
  else
    log "Restore failed; continuing with migrations on existing/empty database."
  fi
fi

cd /app/backend

log "Testing database connection..."
python manage.py check --database default

log "Running migrations..."
python manage.py migrate --noinput

if [ -n "${DJANGO_SUPERUSER_USERNAME:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
  log "Ensuring superuser exists..."
  python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='${DJANGO_SUPERUSER_USERNAME}').exists():
    User.objects.create_superuser('${DJANGO_SUPERUSER_USERNAME}', '${DJANGO_SUPERUSER_EMAIL:-admin@example.com}', '${DJANGO_SUPERUSER_PASSWORD}')
    print('Superuser created')
else:
    print('Superuser already exists')
"
fi

log "Collecting static files..."
python manage.py collectstatic --noinput

if [ "$AUTO_BACKUP" = "1" ] && [ -x /app/scripts/backup_scheduler.sh ]; then
  log "Starting backup scheduler..."
  bash /app/scripts/backup_scheduler.sh &
fi

log "Starting Gunicorn..."
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:80 \
  --workers 3 \
  --timeout 120 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --preload
