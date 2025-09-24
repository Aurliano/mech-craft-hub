#!/bin/bash

echo "Running pre-start script..."

# Change to backend directory
cd backend

# Run migrations
echo "Running database migrations..."
python manage.py migrate --run-syncdb

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Pre-start script finished."
