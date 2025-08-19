#!/bin/sh
###
 # @Author: JustSOOw 117962858+JustSOOw@users.noreply.github.com
 # @Date: 2025-06-29 23:48:37
 # @LastEditors: JustSOOw 117962858+JustSOOw@users.noreply.github.com
 # @LastEditTime: 2025-06-30 00:51:37
 # @FilePath: \XItools\backend\docker-entrypoint.sh
 # @Description: Docker container startup script for XItools backend
 #
 # Copyright (c) 2025 by Furdow, All Rights Reserved.
###

# XItools backend Docker startup script
# Handle database migration and application startup

set -e

echo "Starting XItools backend service..."

# Wait for database to be ready
echo "Waiting for database connection..."
until pg_isready -h postgres -p 5432 -U postgres 2>/dev/null; do
  echo "Database not ready, waiting 5 seconds..."
  sleep 5
done

echo "Database connection successful"

# Run database migrations or push schema when no migrations present
echo "Running database schema setup..."
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null | wc -l)" -gt 0 ]; then
  echo "Detected Prisma migrations. Running migrate deploy..."
  if ! npx prisma migrate deploy; then
    echo "❌ prisma migrate deploy 失败"
    exit 1
  fi
else
  echo "No Prisma migrations found. Running prisma db push to sync schema..."
  if ! npx prisma db push; then
    echo "❌ prisma db push 失败"
    exit 1
  fi
fi

# Generate Prisma client (ensure latest)
echo "Generating Prisma client..."
npx prisma generate || echo "⚠️ prisma generate 失败或已是最新"


echo "Starting application server..."

# Start different modes based on environment
if [ "$NODE_ENV" = "development" ]; then
  echo "Starting in development mode..."
  exec npm run dev
else
  echo "Starting in production mode..."
  exec npm start
fi
