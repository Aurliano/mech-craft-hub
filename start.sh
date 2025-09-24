#!/bin/bash

# Startup script for Liara deployment
set -e

echo "Starting MechCraft Hub..."

# Change to backend directory
cd /app/backend

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput --skip-checks

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --skip-checks

# Start the application
echo "Starting Gunicorn server..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:80 \
    --workers 3 \
    --timeout 120 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --preload
