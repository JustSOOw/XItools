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
until npx prisma db push --accept-data-loss 2>/dev/null; do
  echo "Database not ready, waiting 5 seconds..."
  sleep 5
done

echo "Database connection successful"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration failed or not needed"

# Generate Prisma client (ensure latest)
echo "Generating Prisma client..."
npx prisma generate

echo "Starting application server..."

# Start different modes based on environment
if [ "$NODE_ENV" = "development" ]; then
  echo "Starting in development mode..."
  exec npm run dev
else
  echo "Starting in production mode..."
  exec npm start
fi
