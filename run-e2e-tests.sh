#!/bin/bash

echo "🎭 E2E Test Suite - Quick Start"
echo "================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Playwright is installed
if [ ! -d "node_modules/@playwright" ]; then
    echo "🎭 Installing Playwright..."
    npm install @playwright/test
fi

# Install Playwright browsers
echo "🌐 Installing browsers..."
npx playwright install --with-deps

echo ""
echo "✅ Setup complete!"
echo ""
echo "Choose an option:"
echo "1) Run all tests"
echo "2) Run tests with UI (interactive)"
echo "3) Run tests in headed mode (see browser)"
echo "4) Run only Chromium tests"
echo "5) Run only mobile tests"
echo "6) Debug mode"
echo "7) Show test report"
echo ""
read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo "🧪 Running all tests..."
        npm run test:e2e
        ;;
    2)
        echo "🎨 Opening UI mode..."
        npm run test:e2e:ui
        ;;
    3)
        echo "👀 Running in headed mode..."
        npm run test:e2e:headed
        ;;
    4)
        echo "🌐 Running Chromium tests..."
        npm run test:e2e:chromium
        ;;
    5)
        echo "📱 Running mobile tests..."
        npm run test:e2e:mobile
        ;;
    6)
        echo "🐛 Starting debug mode..."
        npm run test:e2e:debug
        ;;
    7)
        echo "📊 Opening test report..."
        npm run test:e2e:report
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
