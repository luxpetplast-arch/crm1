#!/bin/bash

echo "🚀 Server ishga tushirilmoqda..."

# Run database migrations
echo "🗄️  Database migrations..."
npm run db:push

# Seed initial data (optional)
if [ "$SEED_DATA" = "true" ]; then
  echo "🌱 Seed data yaratilmoqda..."
  npm run db:seed
fi

# Start server
echo "✅ Server ishga tushdi!"
npm start
