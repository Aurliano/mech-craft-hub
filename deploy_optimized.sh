#!/bin/bash

# اسکریپت دیپلوی بهینه برای Liara

echo "🚀 شروع دیپلوی بهینه..."

# اجرای پاکسازی قبل از دیپلوی
echo "🧹 اجرای پاکسازی..."
bash cleanup.sh

# بررسی حجم پروژه
echo "📊 حجم پروژه بعد از پاکسازی:"
du -sh . 2>/dev/null || echo "نمی‌توان حجم را محاسبه کرد"

# ساخت frontend
echo "🏗️ ساخت frontend..."
npm ci --only=production
npm run build

# حذف node_modules بعد از build
echo "🗑️ حذف node_modules بعد از build..."
rm -rf node_modules

# ساخت Docker image
echo "🐳 ساخت Docker image..."
cd backend
docker build -t mechcraft-backend:latest .

# نمایش حجم image
echo "📦 حجم Docker image:"
docker images mechcraft-backend:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo "✅ دیپلوی آماده است!"
echo "💡 برای آپلود به Liara از دستور زیر استفاده کنید:"
echo "liara deploy"
