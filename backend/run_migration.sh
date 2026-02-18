#!/bin/bash
# Script to run migration for messaging feature
# Usage: ./run_migration.sh

echo "Running Django migrations..."
python manage.py migrate

echo "Checking migration status..."
python manage.py showmigrations api | grep -E "(conversation|direct_message)" || echo "Migration not found or already applied"

echo "Done!"
