# راهنمای دیپلوی PWA در Liara - پلتفرم مهندسی سایدا

## تغییرات اعمال شده

### 1. فایل `liara_nginx.conf` به‌روزرسانی شد
- تنظیمات MIME types برای PWA اضافه شد
- Service Worker با MIME type صحیح سرو می‌شود
- Manifest با Content-Type صحیح لود می‌شود
- Cache control مناسب برای فایل‌های مختلف

### 2. فایل `Dockerfile.liara` به‌روزرسانی شد
- مجوزهای فایل‌های PWA تنظیم شد
- اطمینان از دسترسی به فایل‌های PWA

## مراحل دیپلوی

### مرحله 1: Build و Deploy
```bash
# Build پروژه
npm run build

# Commit تغییرات
git add .
git commit -m "Add PWA support with proper MIME types"

# Deploy به Liara
git push origin main
```

### مرحله 2: بررسی فایل‌های PWA
بعد از دیپلوی، فایل‌های زیر باید در دسترس باشند:
- `https://saydatech.ir/service-worker.js`
- `https://saydatech.ir/manifest.json`
- `https://saydatech.ir/icons/`
- `https://saydatech.ir/screenshots/`

### مرحله 3: تست MIME Types
```bash
# تست Service Worker
curl -I https://saydatech.ir/service-worker.js
# باید Content-Type: application/javascript باشد

# تست Manifest
curl -I https://saydatech.ir/manifest.json
# باید Content-Type: application/manifest+json باشد
```

## تنظیمات Nginx اعمال شده

### Service Worker
```nginx
location = /service-worker.js {
    alias /usr/src/app/dist/service-worker.js;
    add_header Content-Type "application/javascript; charset=utf-8";
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Service-Worker-Allowed "/";
    expires -1;
}
```

### Manifest
```nginx
location = /manifest.json {
    alias /usr/src/app/dist/manifest.json;
    add_header Content-Type "application/manifest+json; charset=utf-8";
    add_header Cache-Control "public, max-age=31536000";
    expires 1y;
}
```

### PWA Icons
```nginx
location /icons/ {
    alias /usr/src/app/dist/icons/;
    add_header Cache-Control "public, max-age=31536000";
    expires 1y;
}
```

## تست‌های مورد نیاز

### 1. تست Console
در Console مرورگر باید پیام‌های زیر را ببینید:
```
ServiceWorker registration successful with scope: https://saydatech.ir/
Manifest loaded successfully: {manifest object}
```

### 2. تست PWA Install Guide
- راهنمای نصب باید بعد از 1 ثانیه نمایش داده شود
- دکمه نصب باید کار کند

### 3. تست Service Worker
```javascript
// در Console مرورگر
navigator.serviceWorker.getRegistration()
  .then(registration => console.log('SW Registration:', registration));
```

## عیب‌یابی

### اگر Service Worker هنوز کار نمی‌کند:
1. Console را بررسی کنید
2. Network tab را بررسی کنید
3. MIME types را تست کنید
4. Cache مرورگر را پاک کنید

### اگر Manifest خطا می‌دهد:
1. JSON syntax را بررسی کنید
2. MIME type را تست کنید
3. فایل را دوباره آپلود کنید

## نکات مهم

1. **Cache:** بعد از دیپلوی، cache مرورگر را پاک کنید
2. **HTTPS:** PWA فقط روی HTTPS کار می‌کند
3. **Headers:** مطمئن شوید که headers صحیح تنظیم شده‌اند
4. **Testing:** از اسکریپت‌های تست استفاده کنید

## فایل‌های مهم

- `liara_nginx.conf` - تنظیمات Nginx برای PWA
- `Dockerfile.liara` - Dockerfile با پشتیبانی PWA
- `dist/service-worker.js` - Service Worker
- `dist/manifest.json` - PWA Manifest
- `dist/icons/` - آیکون‌های PWA
- `dist/screenshots/` - تصاویر PWA

## تماس با پشتیبانی
اگر مشکل ادامه داشت، لطفاً:
1. Console errors را ارسال کنید
2. Network requests را بررسی کنید
3. MIME types را تست کنید
4. با تیم فنی تماس بگیرید
