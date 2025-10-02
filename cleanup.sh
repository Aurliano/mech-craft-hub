#!/bin/bash

# اسکریپت پاکسازی فایل‌های اضافی قبل از دیپلوی

echo "🧹 شروع پاکسازی فایل‌های اضافی..."

# پاک کردن node_modules
if [ -d "node_modules" ]; then
    echo "📦 حذف node_modules..."
    rm -rf node_modules
fi

# پاک کردن virtual environment های Python
if [ -d "backend/venv" ]; then
    echo "🐍 حذف backend/venv..."
    rm -rf backend/venv
fi

if [ -d ".venv" ]; then
    echo "🐍 حذف .venv..."
    rm -rf .venv
fi

# پاک کردن فایل‌های cache
echo "🗑️ حذف فایل‌های cache..."
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name ".pytest_cache" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".mypy_cache" -type d -exec rm -rf {} + 2>/dev/null || true

# پاک کردن فایل‌های log
echo "📝 حذف فایل‌های log..."
find . -name "*.log" -delete 2>/dev/null || true

# پاک کردن فایل‌های موقت
echo "🗂️ حذف فایل‌های موقت..."
rm -rf tmp/ temp/ 2>/dev/null || true

# پاک کردن فایل‌های PDF غیرضروری (اختیاری)
echo "📄 حذف فایل‌های PDF غیرضروری..."
find backend/media/uploads/ -name "*.pdf" -size +1M -delete 2>/dev/null || true

echo "✅ پاکسازی کامل شد!"
echo "📊 حجم پروژه بعد از پاکسازی:"
du -sh . 2>/dev/null || echo "نمی‌توان حجم را محاسبه کرد"
