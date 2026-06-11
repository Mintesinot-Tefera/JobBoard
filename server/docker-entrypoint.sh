#!/bin/sh
set -e

echo "Running database migrations..."
until npx prisma migrate deploy; do
  echo "Migration failed, retrying in 2s..."
  sleep 2
done

echo "Starting server..."
exec node dist/index.js
