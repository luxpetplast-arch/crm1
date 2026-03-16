@echo off
echo 🎭 E2E Test Setup
echo ==================
echo.

echo 📦 Step 1: Installing Playwright...
call npm install --save-dev @playwright/test@latest

if %errorlevel% neq 0 (
    echo ❌ Failed to install Playwright
    pause
    exit /b 1
)

echo.
echo 🌐 Step 2: Installing browsers...
call npx playwright install --with-deps

if %errorlevel% neq 0 (
    echo ❌ Failed to install browsers
    pause
    exit /b 1
)

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Start dev server: npm run dev
echo 2. Run tests: npm run test:e2e:ui
echo.
pause
