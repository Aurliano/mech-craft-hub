web: cd backend && python manage.py migrate --run-syncdb && gunicorn config.wsgi:application --bind 0.0.0.0:80 --workers 3 --timeout 120
