web: cd backend; python manage.py migrate --run-syncdb; cd ..; gunicorn wsgi:application --bind 0.0.0.0:80 --workers 3 --timeout 120 --max-requests 1000 --max-requests-jitter 100 --preload
