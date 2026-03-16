@echo off
echo 🎭 E2E Test Suite - Quick Start
echo ================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Check if Playwright is installed
if not exist "node_modules\@playwright" (
    echo 🎭 Installing Playwright...
    call npm install @playwright/test
)

REM Install Playwright browsers
echo 🌐 Installing browsers...
call npx playwright install --with-deps

echo.
echo ✅ Setup complete!
echo.
echo Choose an option:
echo 1) Run all tests
echo 2) Run tests with UI (interactive)
echo 3) Run tests in headed mode (see browser)
echo 4) Run only Chromium tests
echo 5) Run only mobile tests
echo 6) Debug mode
echo 7) Show test report
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    echo 🧪 Running all tests...
    call npm run test:e2e
) else if "%choice%"=="2" (
    echo 🎨 Opening UI mode...
    call npm run test:e2e:ui
) else if "%choice%"=="3" (
    echo 👀 Running in headed mode...
    call npm run test:e2e:headed
) else if "%choice%"=="4" (
    echo 🌐 Running Chromium tests...
    call npm run test:e2e:chromium
) else if "%choice%"=="5" (
    echo 📱 Running mobile tests...
    call npm run test:e2e:mobile
) else if "%choice%"=="6" (
    echo 🐛 Starting debug mode...
    call npm run test:e2e:debug
) else if "%choice%"=="7" (
    echo 📊 Opening test report...
    call npm run test:e2e:report
) else (
    echo ❌ Invalid choice
    exit /b 1
)

echo.
echo ✅ Done!
pause
