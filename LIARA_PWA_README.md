# PWA Support in Liara - پلتفرم مهندسی سایدا

## تغییرات اعمال شده

### 1. فایل‌های پیکربندی به‌روزرسانی شدند:

#### `liara_nginx.conf`
- تنظیمات MIME types برای PWA
- Service Worker با `application/javascript` MIME type
- Manifest با `application/manifest+json` MIME type
- Cache control مناسب برای فایل‌های مختلف

#### `Dockerfile.liara`
- مجوزهای فایل‌های PWA تنظیم شد
- اطمینان از دسترسی به فایل‌های PWA

#### `deploy_liara.sh`
- بررسی وجود فایل‌های PWA قبل از دیپلوی
- تایید فایل‌های ضروری PWA

### 2. فایل‌های تست ایجاد شدند:

#### `test-pwa-liara.sh`
- اسکریپت تست خودکار PWA
- بررسی MIME types
- بررسی دسترسی به فایل‌ها
- تست Cache headers

#### `LIARA_PWA_DEPLOYMENT.md`
- راهنمای کامل دیپلوی PWA
- مراحل تست و عیب‌یابی

## مراحل دیپلوی

### 1. Build پروژه
```bash
npm run build
```

### 2. تست محلی
```bash
# در Windows
./test-pwa-liara.sh

# در Linux/Mac
chmod +x test-pwa-liara.sh
./test-pwa-liara.sh
```

### 3. دیپلوی به Liara
```bash
./deploy_liara.sh
```

## فایل‌های PWA مورد نیاز

### فایل‌های اصلی:
- `dist/service-worker.js` - Service Worker
- `dist/manifest.json` - PWA Manifest
- `dist/web.config` - تنظیمات IIS

### فایل‌های آیکون:
- `dist/icons/icon-192x192.png`
- `dist/icons/icon-512x512.png`
- `dist/icons/shortcut-*.png`

### فایل‌های تصویر:
- `dist/screenshots/desktop-screenshot.png`
- `dist/screenshots/mobile-screenshot.png`

## تنظیمات Nginx

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

## تست‌های مورد نیاز

### 1. تست MIME Types
```bash
curl -I https://saydatech.ir/service-worker.js
curl -I https://saydatech.ir/manifest.json
```

### 2. تست در مرورگر
1. باز کردن `https://saydatech.ir`
2. باز کردن Developer Tools > Console
3. بررسی پیام‌های Service Worker
4. بررسی PWA Install Guide

### 3. تست PWA Features
- نصب اپلیکیشن
- کارکرد Offline
- Push Notifications (در آینده)

## عیب‌یابی

### مشکلات رایج:

#### Service Worker خطا می‌دهد
- بررسی MIME type: `application/javascript`
- بررسی Cache headers: `no-cache`
- بررسی Console errors

#### Manifest خطا می‌دهد
- بررسی MIME type: `application/manifest+json`
- بررسی JSON syntax
- بررسی فیلدهای ضروری

#### PWA Install Guide نمایش داده نمی‌شود
- بررسی `canShowInstallPrompt()` در `usePWA.ts`
- بررسی localStorage
- بررسی Console logs

## نکات مهم

1. **HTTPS ضروری است** - PWA فقط روی HTTPS کار می‌کند
2. **MIME Types مهم است** - باید صحیح تنظیم شوند
3. **Cache Control** - Service Worker نباید cache شود
4. **Testing** - همیشه تست کنید

## فایل‌های مرتبط

- `liara_nginx.conf` - تنظیمات Nginx
- `Dockerfile.liara` - Dockerfile
- `deploy_liara.sh` - اسکریپت دیپلوی
- `test-pwa-liara.sh` - اسکریپت تست
- `LIARA_PWA_DEPLOYMENT.md` - راهنمای دیپلوی

## تماس با پشتیبانی

اگر مشکل ادامه داشت:
1. Console errors را ارسال کنید
2. Network requests را بررسی کنید
3. MIME types را تست کنید
4. با تیم فنی تماس بگیرید
