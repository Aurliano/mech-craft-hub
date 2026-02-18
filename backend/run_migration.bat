@echo off
REM Script to run migration for messaging feature on Windows
REM Usage: run_migration.bat

echo Running Django migrations...
python manage.py migrate

echo Checking migration status...
python manage.py showmigrations api | findstr /i "conversation direct_message" || echo Migration not found or already applied

echo Done!
pause
