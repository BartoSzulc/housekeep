#!/bin/bash
# Deploy script for HouseKeep API on Mikrus
# Usage: ssh user@mikrus 'bash -s' < deploy.sh

set -e

APP_DIR="/opt/housekeep-api"

echo "==> Pulling latest code..."
cd $APP_DIR
git pull origin main

echo "==> Copying production env..."
cp .env.production .env

echo "==> Generating app key if needed..."
if grep -q "APP_KEY=$" .env; then
    docker compose exec app php artisan key:generate --force
fi

echo "==> Building containers..."
docker compose build --no-cache app

echo "==> Starting services..."
docker compose up -d

echo "==> Waiting for database..."
sleep 10

echo "==> Running migrations..."
docker compose exec app php artisan migrate --force

echo "==> Clearing caches..."
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache

echo "==> Done! API is running on port 8080"
echo "==> Set up reverse proxy (Nginx/Caddy) to forward your domain to localhost:8080"
