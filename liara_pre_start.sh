#!/bin/bash

echo "Running pre-start script..."

# Set environment variables
export DJANGO_SETTINGS_MODULE=backend.config.settings_ultra_simple
export PYTHONPATH=/app

# Change to backend directory
cd backend

# Run migrations
echo "Running database migrations..."
python manage.py migrate --run-syncdb

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Pre-start script finished."
