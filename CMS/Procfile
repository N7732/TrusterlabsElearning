web: if [ -d "CMS" ] && [ ! -f "manage.py" ]; then cd CMS; fi && python manage.py migrate --noinput && gunicorn CMS.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 4 --threads 2 --timeout 120
