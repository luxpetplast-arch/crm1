@echo off
chcp 65001 >nul
cls
echo ============================================
echo    ZAVOD TIZIMI - Noutbuk Sozlash
echo ============================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js o'rnatilmagan!
    echo     Node.js ni yuklab oling: https://nodejs.org
    echo     LTS versiyani tanlang (18+)
    pause
    exit /b 1
)

echo [✓] Node.js topildi
node --version

:: Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [X] Git o'rnatilmagan!
    echo     Git ni yuklab oling: https://git-scm.com
    pause
    exit /b 1
)

echo [✓] Git topildi
git --version
echo.

:: Ask for laptop number
set /p LAPTOP_NUM="Noutbuk raqamini kiriting (1, 2, 3...): "

if "%LAPTOP_NUM%"=="" (
    echo [X] Noutbuk raqami kiritilmadi!
    pause
    exit /b 1
)

:: Set device name based on number
if "%LAPTOP_NUM%"=="1" set DEVICE_NAME=Asosiy Kassa
if "%LAPTOP_NUM%"=="2" set DEVICE_NAME=Zaxira Kassa
if "%LAPTOP_NUM%"=="3" set DEVICE_NAME=Ombor Kassa
if "%LAPTOP_NUM%"=="4" set DEVICE_NAME=Qo'shimcha Kassa
if "%LAPTOP_NUM%"=="5" set DEVICE_NAME=Ofis Kassa
if "%LAPTOP_NUM%"=="6" set DEVICE_NAME=Zavod Kassa
if "%LAPTOP_NUM%"=="7" set DEVICE_NAME=Sotuv Kassa
if "%LAPTOP_NUM%"=="8" set DEVICE_NAME=Boshqaruv Kassa
if "%LAPTOP_NUM%"=="9" set DEVICE_NAME=Admin Kassa
if "%LAPTOP_NUM%"=="10" set DEVICE_NAME=Korxona Kassa

if "%DEVICE_NAME%"=="" set DEVICE_NAME=Kassa %LAPTOP_NUM%

echo.
echo [i] Noutbuk nomi: %DEVICE_NAME%
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo [X] Noto'g'ri papka!
    echo     Bu scriptni zavod-tizimi papkasida ishga tushiring.
    pause
    exit /b 1
)

echo [✓] Loyiha papkasi topildi
echo.

:: Install dependencies
echo [1/4] Package o'rnatilmoqda...
call npm install
if errorlevel 1 (
    echo [X] Package o'rnatishda xato!
    pause
    exit /b 1
)
echo [✓] Package o'rnatildi
echo.

:: Create .env file
echo [2/4] .env fayl yaratilmoqda...

:: Check if .env exists
if exist ".env" (
    echo [!] .env fayl allaqachon mavjud
    set /p OVERWRITE="Qayta yozilsinmi? (ha/yo'q): "
    if /i not "%OVERWRITE%"=="ha" (
        echo [i] .env o'zgartirilmadi
        goto :db_setup
    )
)

:: Read Supabase URL and key from .env.example
for /f "tokens=1,2 delims==" %%a in (.env.example) do (
    if "%%a"=="VITE_SUPABASE_URL" set SUPABASE_URL=%%b
    if "%%a"=="VITE_SUPABASE_ANON_KEY" set SUPABASE_KEY=%%b
)

:: Create .env file
echo # Device Configuration > .env
echo VITE_DEVICE_ID=laptop_%LAPTOP_NUM% >> .env
echo VITE_DEVICE_NAME="%DEVICE_NAME%" >> .env
echo. >> .env
echo # Supabase Configuration >> .env
echo VITE_SUPABASE_URL=%SUPABASE_URL% >> .env
echo VITE_SUPABASE_ANON_KEY=%SUPABASE_KEY% >> .env
echo. >> .env
echo # Local Database >> .env
echo DATABASE_URL="file:./prisma/dev.db" >> .env
echo. >> .env
echo # Server Configuration >> .env
echo PORT=5004 >> .env
echo NODE_ENV=development >> .env
echo JWT_SECRET="your-secret-key-%RANDOM%" >> .env
echo. >> .env
echo # Exchange Rates >> .env
echo USD_TO_UZS_RATE=12500 >> .env

echo [✓] .env fayl yaratildi
echo.

:db_setup
:: Setup database
echo [3/4] Database sozlanmoqda...
call npx prisma generate
if errorlevel 1 (
    echo [X] Prisma generate xato!
    pause
    exit /b 1
)

call npx prisma db push
if errorlevel 1 (
    echo [X] Database push xato!
    pause
    exit /b 1
)

echo [✓] Database sozlandi
echo.

:: Optional seed data
set /p SEED="Test ma'lumotlar qo'shilsinmi? (ha/yo'q): "
if /i "%SEED%"=="ha" (
    echo [i] Test ma'lumotlar qo'shilmoqda...
    call npm run db:seed
    echo [✓] Test ma'lumotlar qo'shildi
    echo.
)

:: Create desktop shortcut
echo [4/4] Ilova shortcut yaratilmoqda...
(
echo @echo off
echo cd /d "%~dp0"
echo start cmd /k "npm run dev"
) > "Start Zavod Tizimi.bat"

echo [✓] Shortcut yaratildi: "Start Zavod Tizimi.bat"
echo.

:: Success message
echo ============================================
echo    SOZLASH TUGADI! ✅
echo ============================================
echo.
echo Noutbuk ma'lumotlari:
echo   - ID: laptop_%LAPTOP_NUM%
echo   - Nomi: %DEVICE_NAME%
echo.
echo Ishga tushirish:
echo   npm run dev
echo.
echo Yoki "Start Zavod Tizimi.bat" ni bosing
echo.
echo Qo'llanma: MULTI_LAPTOP_SETUP.md
echo.
pause
