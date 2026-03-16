#!/bin/bash

echo "🎭 E2E Test Setup"
echo "=================="
echo ""

echo "📦 Step 1: Installing Playwright..."
npm install --save-dev @playwright/test@latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Playwright"
    exit 1
fi

echo ""
echo "🌐 Step 2: Installing browsers..."
npx playwright install --with-deps

if [ $? -ne 0 ]; then
    echo "❌ Failed to install browsers"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Run tests: npm run test:e2e:ui"
echo ""
