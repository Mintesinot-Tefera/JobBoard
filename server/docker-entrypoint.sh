#!/bin/sh
set -e

echo "Pushing schema to database..."
until npx prisma db push --accept-data-loss; do
  echo "Schema push failed, retrying in 2s..."
  sleep 2
done

echo "Starting server..."
exec node dist/index.js
