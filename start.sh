#!/bin/bash

# Startup script for Liara deployment
set -e

echo "Starting MechCraft Hub..."

# Change to backend directory
cd /app/backend

# Copy test script to container
echo "Copying database test script..."
cp /app/test_db_connection.py /app/backend/test_db_connection.py

# Test database connection first
echo "Testing database connection..."
python /app/backend/test_db_connection.py

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the application
echo "Starting Gunicorn server..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:80 \
    --workers 3 \
    --timeout 120 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --preload
