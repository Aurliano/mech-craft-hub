# راهنمای کامل دیپلوی با باکت لیارا

## 🎯 اطلاعات باکت شما:
- **نام باکت**: `resources`
- **Endpoint**: `https://storage.c2.liara.space`
- **منطقه**: `iran`

## 📋 مراحل دیپلوی:

### 1. تنظیم متغیرهای محیطی در Liara

در پنل کاربری Liara، در بخش **"تنظیمات"** → **"متغیرهای محیطی"** موارد زیر را اضافه کنید:

```bash
# نوع storage
FILE_STORAGE_TYPE=liara

# نام باکت
FILE_BUCKET_NAME=resources

# منطقه لیارا
FILE_REGION=iran

# دسترسی عمومی
FILE_PUBLIC_ACCESS=true

# کلیدهای API (از پنل باکت کپی کنید)
LIARA_ACCESS_KEY=your-access-key-here
LIARA_SECRET_KEY=your-secret-key-here
LIARA_ENDPOINT_URL=https://storage.c2.liara.space

# تنظیمات فایل
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,video/mp4,video/avi,video/mov,application/zip,application/x-rar-compressed,application/x-7z-compressed
```

### 2. دریافت کلیدهای API

1. به پنل لیارا بروید
2. **"فضای ذخیره‌سازی ابری"** را انتخاب کنید
3. باکت `resources` را انتخاب کنید
4. روی تب **"کلیدها"** کلیک کنید
5. **"ایجاد کلید"** را کلیک کنید
6. نام کلید: `mechcraft-file-manager`
7. سطح دسترسی: **"خواندن و نوشتن"**
8. کلیدهای تولید شده را کپی کنید

### 3. تست محلی (اختیاری)

```bash
# تنظیم متغیرهای محیطی محلی
export LIARA_ACCESS_KEY="your-access-key"
export LIARA_SECRET_KEY="your-secret-key"

# تست اتصال
cd backend
python quick_test_liara.py
```

### 4. دیپلوی پروژه

```bash
# در Liara
git push origin main
```

### 5. تست پس از دیپلوی

#### 5.1 تست API آپلود:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "title=تست کتاب" \
  -F "content_type=book" \
  -F "category=mechatronics" \
  https://your-domain.com/api/v1/files/upload/
```

#### 5.2 تست API دانلود:
```bash
curl -X GET \
  https://your-domain.com/api/v1/files/{content_id}/download/
```

## 🔧 استفاده در فرانت‌اند:

### 1. اضافه کردن route:
```typescript
// در App.tsx
<Route path="/file-manager" element={<FileManager />} />
```

### 2. لینک در Navbar (برای ادمین‌ها):
```typescript
// در Navbar.tsx
<Link to="/file-manager">مدیریت فایل‌ها</Link>
```

## 📊 ساختار فایل‌ها در باکت:

```
resources/
├── scientific-content/
│   ├── books/
│   │   └── 2024/01/15/
│   │       └── book_title_hash.pdf
│   ├── articles/
│   │   └── 2024/01/15/
│   │       └── article_title_hash.pdf
│   ├── software/
│   │   └── 2024/01/15/
│   │       └── software_name_hash.zip
│   └── videos/
│       └── 2024/01/15/
│           └── video_title_hash.mp4
```

## 🌐 URL فایل‌ها:

فایل‌های عمومی با URL زیر قابل دسترسی هستند:
```
https://storage.c2.liara.space/resources/scientific-content/books/2024/01/15/book_title_hash.pdf
```

## ⚠️ نکات مهم:

1. **امنیت**: کلیدهای API را در جای امن نگهداری کنید
2. **حجم فایل**: حداکثر 100MB برای هر فایل
3. **انواع فایل**: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, MP4, AVI, MOV, ZIP, RAR, 7Z
4. **دسترسی**: فایل‌ها به صورت عمومی قابل دسترسی هستند

## 🚨 عیب‌یابی:

### خطای اتصال:
- بررسی کلیدهای API
- بررسی نام باکت
- بررسی endpoint URL

### خطای آپلود:
- بررسی حجم فایل
- بررسی نوع فایل
- بررسی دسترسی‌های باکت

## 📞 پشتیبانی:

در صورت بروز مشکل:
1. لاگ‌های سرور را بررسی کنید
2. تست اتصال را اجرا کنید
3. تنظیمات متغیرهای محیطی را بررسی کنید