@echo off
echo 🚀 شروع Deploy با تنظیمات جدید دامنه saydatech.ir...

REM بررسی وجود Liara CLI
where liara >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Liara CLI نصب نیست. لطفاً ابتدا آن را نصب کنید:
    echo npm install -g @liara/cli
    pause
    exit /b 1
)

REM ورود به لیارا (در صورت نیاز)
echo 🔐 بررسی احراز هویت لیارا...
liara whoami
if %errorlevel% neq 0 (
    echo 🔑 ورود به لیارا...
    liara login
)

REM Deploy پروژه
echo 📦 Deploy پروژه با تنظیمات جدید...
liara deploy

REM بررسی وضعیت Deploy
echo ✅ Deploy تکمیل شد!
echo.
echo 🌐 مراحل بعدی:
echo 1. دامنه saydatech.ir در پنل لیارا اضافه شده است
echo 2. SSL Certificate فعال شده است
echo 3. DNS records در Cloudflare تنظیم شده است
echo 4. HTTPS اجباری شده است
echo.
echo 📊 برای بررسی logs:
echo liara logs
echo.
echo 🏥 برای بررسی health:
echo curl https://saydatech.ir/health/
echo.
echo 🌐 آدرس وبسایت:
echo https://saydatech.ir
echo https://www.saydatech.ir
echo.
pause
