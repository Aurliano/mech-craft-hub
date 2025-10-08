# راهنمای تنظیم Liara Bucket برای مدیریت فایل‌ها

## 🔧 تنظیمات مورد نیاز

### 1. متغیرهای محیطی در Liara

در پنل Liara، متغیرهای زیر را اضافه کنید:

```bash
# نوع storage
FILE_STORAGE_TYPE=liara

# نام باکت
FILE_BUCKET_NAME=resources

# منطقه
FILE_REGION=iran

# دسترسی عمومی
FILE_PUBLIC_ACCESS=true

# کلیدهای API لیارا
LIARA_ACCESS_KEY=your_access_key_here
LIARA_SECRET_KEY=your_secret_key_here
LIARA_ENDPOINT_URL=https://storage.c2.liara.space
```

### 2. ایجاد باکت در Liara

1. وارد پنل Liara شوید
2. به بخش "Object Storage" بروید
3. باکت جدیدی با نام `resources` ایجاد کنید
4. کلیدهای API را ایجاد کنید

### 3. تست اتصال

پس از تنظیم متغیرها، دستور زیر را در shell لیارا اجرا کنید:

```bash
cd backend
python manage.py shell -c "
from api.file_manager import FileManager
fm = FileManager()
print('Storage type:', fm.storage_type)
print('Bucket name:', fm.bucket_name)
print('S3 client available:', fm.s3_client is not None)
"
```

## 📁 ساختار فایل‌ها در باکت

```
resources/
├── scientific-content/
│   ├── articles/
│   ├── books/
│   ├── software/
│   └── videos/
├── user-uploads/
└── temp/
```

## 🔐 دسترسی‌ها

- **عمومی:** فایل‌های علمی (مقالات، کتاب‌ها)
- **خصوصی:** فایل‌های کاربران (نیاز به احراز هویت)

## 📊 آمار استفاده

- حداکثر اندازه فایل: 100MB
- انواع فایل مجاز: PDF, DOCX, PPTX, XLSX, MP4, ZIP, RAR, 7Z

## 🚀 استفاده در کد

```python
from api.file_manager import FileManager

# ایجاد instance
fm = FileManager()

# آپلود فایل
result = fm.upload_file(file_obj, 'document.pdf', 'application/pdf')

# دریافت URL فایل
file_url = fm.get_file_url('scientific-content/articles/document.pdf')

# حذف فایل
fm.delete_file('scientific-content/articles/document.pdf')
```

## ⚠️ نکات مهم

1. **امنیت:** کلیدهای API را در متغیرهای محیطی نگه دارید
2. **پشتیبان‌گیری:** فایل‌های مهم را در جای دیگری هم نگه دارید
3. **محدودیت‌ها:** حداکثر اندازه فایل را رعایت کنید
4. **بهینه‌سازی:** فایل‌های بزرگ را فشرده کنید
