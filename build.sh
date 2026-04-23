#!/bin/bash

echo "🚀 Build boshlandi..."

# Install dependencies
echo "📦 Dependencies o'rnatilmoqda..."
npm install

# Generate Prisma Client (build dan oldin)
echo "🗄️  Prisma Client yaratilmoqda..."
npm run db:generate

# Build frontend
echo "🎨 Frontend build qilinmoqda..."
npm run build

# Build backend
echo "🔨 Backend build qilinmoqda..."
npm run build:server

echo "✅ Build tugadi!"
echo "📁 Backend output: dist-server/"
echo "📁 Frontend output: dist/"
