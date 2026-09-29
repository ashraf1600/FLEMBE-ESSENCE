#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Collecting static files..."
python manage.py collectstatic --no-input

echo "==> Running database migrations..."
python manage.py migrate

# Create superuser if credentials are provided in Render environment variables
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "==> Creating Django superuser ($DJANGO_SUPERUSER_USERNAME)..."
    python manage.py createsuperuser --noinput || echo "Note: Superuser already exists or could not be created."
fi

# Ensure admin accounts (admin and Nehal) exist and have superuser rights
echo "==> Ensuring admin superuser accounts..."
python manage.py ensure_admin || echo "Note: ensure_admin completed with warnings."

# Seed initial store catalog data if enabled
if [ "$AUTO_SEED" = "True" ] || [ "$AUTO_SEED" = "true" ] || [ "$AUTO_SEED" = "1" ]; then
    echo "==> Seeding catalog products and delivery zones..."
    python manage.py seed_data || echo "Note: Seed data already initialized."
fi

echo "==> Build script completed successfully!"
