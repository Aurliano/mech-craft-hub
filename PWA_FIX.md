# 🔧 راهنمای رفع مشکل PWA

## مشکل
فایل‌های PWA با MIME type نادرست سرو می‌شدند:
- `/service-worker.js` → `text/html` (باید `application/javascript`)
- `/manifest.json` → `text/html` (باید `application/manifest+json`)

## تغییرات اعمال شده

### 1. Django URLs (backend/config/urls.py) ✅
- اضافه شدن view های اختصاصی برای فایل‌های PWA
- تنظیم MIME types صحیح
- اضافه شدن HTTP headers مناسب

### 2. Nginx Configuration (liara_nginx.conf) ✅
- حذف location blocks مربوط به PWA از Nginx
- اعتماد به Django برای سرو کردن فایل‌های PWA

## مراحل دیپلوی

```bash
# 1. Commit تغییرات
git add backend/config/urls.py liara_nginx.conf
git commit -m "Fix PWA: Django now serves service-worker and manifest with correct MIME types"

# 2. Push به Liara
git push origin main

# 3. Liara به صورت خودکار rebuild و redeploy می‌کند
```

## تست بعد از دیپلوی

```bash
# تست Service Worker
curl -I https://saydatech.ir/service-worker.js
# Expected: content-type: application/javascript; charset=utf-8

# تست Manifest
curl -I https://saydatech.ir/manifest.json
# Expected: content-type: application/manifest+json; charset=utf-8

# تست یک بدن 
curl https://saydatech.ir/service-worker.js | head -n 5
# Expected: محتوای JavaScript فایل service-worker
```

## بررسی موفقیت

بعد از دیپلوی، در مرورگر موبایل:
1. Developer Tools → Application → Service Workers → باید فعال باشد
2. Developer Tools → Application → Manifest → باید فایل manifest نمایش داده شود
3. در نوار آدرس موبایل، آیکون 📲 یا ➕ (افزودن به صفحه اصلی) ظاهر شود

## نکات

- اگر هنوز کار نکرد، cache مرورگر را پاک کنید
- در Chrome: DevTools → Application → Clear Storage → Clear site data
- Service Worker را unregister و دوباره register کنید

