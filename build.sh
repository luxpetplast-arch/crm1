#!/bin/bash

echo "🚀 Build boshlandi..."

# Install dependencies
echo "📦 Dependencies o'rnatilmoqda..."
npm install

# Build backend
echo "🔨 Backend build qilinmoqda..."
npm run build:server

# Build frontend
echo "🎨 Frontend build qilinmoqda..."
npm run build

# Generate Prisma Client
echo "🗄️  Prisma Client yaratilmoqda..."
npm run db:generate

echo "✅ Build tugadi!"
