# راهنمای دیپلوی PWA - پلتفرم مهندسی سایدا

## مشکل فعلی
سرور فایل‌های PWA را با MIME type اشتباه سرو می‌کند:
- `service-worker.js` با `text/html` به جای `application/javascript`
- `manifest.json` با `text/html` به جای `application/manifest+json`

## راه‌حل‌های ارائه شده

### 1. فایل .htaccess (برای Apache)
فایل `public/.htaccess` را روی سرور آپلود کنید.

### 2. فایل nginx.conf (برای Nginx)
فایل `nginx-pwa.conf` را در تنظیمات Nginx قرار دهید.

### 3. فایل web.config (برای IIS)
فایل `public/web.config` را روی سرور آپلود کنید.

## مراحل دیپلوی

### مرحله 1: آپلود فایل‌های پیکربندی
```bash
# آپلود فایل‌های پیکربندی سرور
scp public/.htaccess user@server:/path/to/website/
scp public/web.config user@server:/path/to/website/
scp nginx-pwa.conf user@server:/etc/nginx/sites-available/
```

### مرحله 2: تنظیم مجوزها
```bash
# تنظیم مجوزهای فایل
chmod 644 public/.htaccess
chmod 644 public/web.config
chmod 644 nginx-pwa.conf
```

### مرحله 3: ریستارت سرور
```bash
# برای Apache
sudo systemctl restart apache2

# برای Nginx
sudo systemctl restart nginx

# برای IIS
iisreset
```

### مرحله 4: تست MIME types
```bash
# تست Service Worker
curl -I https://saydatech.ir/service-worker.js

# تست Manifest
curl -I https://saydatech.ir/manifest.json
```

## فایل‌های جدید ایجاد شده

1. **`public/service-worker.js`** - Service Worker جدید و بهبود یافته
2. **`public/.htaccess`** - تنظیمات Apache برای MIME types
3. **`public/web.config`** - تنظیمات IIS برای MIME types
4. **`nginx-pwa.conf`** - تنظیمات Nginx برای MIME types
5. **`public/mime-test.js`** - اسکریپت تست MIME types
6. **`src/main.tsx`** - بهبود registration Service Worker

## تست‌های مورد نیاز

### 1. تست MIME Types
```javascript
// در Console مرورگر
fetch('/service-worker.js', { method: 'HEAD' })
  .then(response => console.log('SW MIME:', response.headers.get('content-type')));

fetch('/manifest.json', { method: 'HEAD' })
  .then(response => console.log('Manifest MIME:', response.headers.get('content-type')));
```

### 2. تست Service Worker
```javascript
// در Console مرورگر
navigator.serviceWorker.getRegistration()
  .then(registration => console.log('SW Registration:', registration));
```

### 3. تست PWA Install Guide
- راهنمای نصب باید بعد از 1 ثانیه نمایش داده شود
- دکمه نصب باید کار کند

## نکات مهم

1. **Cache:** بعد از آپلود فایل‌های جدید، cache مرورگر را پاک کنید
2. **HTTPS:** PWA فقط روی HTTPS کار می‌کند
3. **Headers:** مطمئن شوید که headers صحیح تنظیم شده‌اند
4. **Testing:** از اسکریپت‌های تست استفاده کنید

## عیب‌یابی

### اگر Service Worker هنوز کار نمی‌کند:
1. Console را بررسی کنید
2. Network tab را بررسی کنید
3. MIME types را تست کنید
4. سرور را ریستارت کنید

### اگر Manifest خطا می‌دهد:
1. JSON syntax را بررسی کنید
2. MIME type را تست کنید
3. فایل را دوباره آپلود کنید

## تماس با پشتیبانی
اگر مشکل ادامه داشت، لطفاً:
1. Console errors را ارسال کنید
2. Network requests را بررسی کنید
3. MIME types را تست کنید
4. با تیم فنی تماس بگیرید
