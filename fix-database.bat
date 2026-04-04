@echo off
echo ========================================
echo   Database Fix Script
echo ========================================
echo.

echo Step 1: Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed!
    pause
    exit /b 1
)
echo ✅ Prisma Client generated
echo.

echo Step 2: Pushing schema to database...
call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo ERROR: Database push failed!
    pause
    exit /b 1
)
echo ✅ Database schema updated
echo.

echo Step 3: Checking database...
call npx prisma studio --browser none &
timeout /t 2 /nobreak > nul
taskkill /F /IM "prisma.exe" 2>nul
echo ✅ Database check complete
echo.

echo ========================================
echo   All Done! Restart your server now.
echo ========================================
pause
