#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Extract DB connection variables or set default composer ports
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

echo "Waiting for PostgreSQL database at $DB_HOST:$DB_PORT..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 0.5
done
echo "PostgreSQL database is online and reachable!"

echo "Applying Django database migrations..."
python manage.py migrate --noinput

echo "Collecting Django static files..."
python manage.py collectstatic --noinput

# Dynamically seed database on startup if AUTO_SEED=True env parameter is active
if [ "$AUTO_SEED" = "True" ] || [ "$AUTO_SEED" = "true" ]; then
  echo "AUTO_SEED parameter is active! Seeding marketplace demo data..."
  python seed_marketplace.py --reset
fi

echo "Starting Gunicorn application server..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
