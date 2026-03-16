@echo off
echo ========================================
echo    FULL E2E TEST SUITE - AzizTrades ERP
echo ========================================
echo.

echo [1/5] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo [2/5] Installing Playwright browsers...
call npx playwright install --with-deps chromium

echo.
echo [3/5] Setting up database...
call npm run db:generate
call npm run db:push

echo.
echo [4/5] Starting development server...
echo Please start the server manually in another terminal:
echo    npm run dev
echo.
echo Press any key when server is running on http://localhost:3000...
pause

echo.
echo [5/5] Running E2E tests...
echo.
echo ========================================
echo    TEST EXECUTION STARTED
echo ========================================
echo.

call npx playwright test --project=chromium

echo.
echo ========================================
echo    TEST EXECUTION COMPLETED
echo ========================================
echo.
echo Opening test report...
call npx playwright show-report

echo.
echo Done! Check the report for details.
pause
