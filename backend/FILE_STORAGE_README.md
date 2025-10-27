# File Storage Architecture - پلتفرم مهندسی سایدا

## معماری ذخیره‌سازی فایل‌ها

این سیستم از دو نوع ذخیره‌سازی جداگانه برای مدیریت فایل‌ها استفاده می‌کند:

### 1. Liara Object Storage (S3)
**کاربرد**: مقالات، کتاب‌ها، محتوای علمی
- **دسترسی**: عمومی (public-read)
- **مزایا**: CDN، سرعت بالا، هزینه پایین
- **کلاس مدیریت**: `ScientificFileManager`

### 2. Local Storage
**کاربرد**: فایل‌های آپلودی کاربران، فایل‌های تحویلی
- **دسترسی**: خصوصی با احراز هویت
- **مزایا**: کنترل کامل، امنیت بالا
- **کلاس مدیریت**: `UserFileManager`

## راه‌اندازی

### 1. تنظیم Liara Object Storage

1. وارد پنل Liara شوید
2. به بخش Object Storage بروید
3. یک bucket جدید با نام `resources` ایجاد کنید
4. Access Key و Secret Key را کپی کنید

### 2. تنظیم Environment Variables

```bash
# کپی فایل نمونه
cp backend/env.liara.example backend/.env

# ویرایش فایل و اضافه کردن اطلاعات Liara
nano backend/.env
```

مقادیر زیر را تنظیم کنید:
```env
LIARA_ACCESS_KEY_ID=your-access-key
LIARA_SECRET_ACCESS_KEY=your-secret-key
FILE_BUCKET_NAME=resources
```

### 3. تست اتصال

```bash
cd backend
python test_liara_s3.py
```

## API Endpoints

### محتوای علمی (S3)
```
POST /api/v1/scientific/upload/
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
Body: file=<file>
```

### فایل‌های کاربران (Local)
```
POST /api/v1/user-files/upload/
Authorization: Bearer <user-token>
Content-Type: multipart/form-data
Body: file=<file>, order_id=<uuid> (optional)
```

### فایل‌های تحویلی
```
# آپلود فایل تحویلی
POST /api/v1/deliveries/upload/
Authorization: Bearer <contractor-token>
Content-Type: application/json
Body: {
    "order_id": "uuid",
    "file": <file>,
    "description": "توضیحات",
    "expires_in_days": 30
}

# دانلود فایل تحویلی
GET /api/v1/deliveries/<file_id>/download/
Authorization: Bearer <user-token>

# لیست فایل‌های تحویلی یک سفارش
GET /api/v1/orders/<order_id>/deliveries/
Authorization: Bearer <user-token>
```

## ساختار دایرکتوری‌ها

```
media/
├── scientific-content/       # محتوای علمی (S3)
│   ├── books/               # کتاب‌ها
│   ├── documents/           # مقالات و اسناد
│   ├── videos/              # ویدئوها
│   ├── software/            # نرم‌افزارها
│   └── others/              # سایر
│
├── user-uploads/            # آپلودهای کاربران (Local)
│   ├── users/{user_id}/     # فایل‌های شخصی
│   └── orders/{order_id}/   # فایل‌های سفارشات
│
└── deliveries/              # فایل‌های تحویلی (Local)
    └── {order_id}/          # فایل‌های تحویلی هر سفارش
```

## مدل DeliveryFile

مدل `DeliveryFile` برای مدیریت فایل‌های تحویلی ایجاد شده است:

```python
class DeliveryFile(models.Model):
    order = models.ForeignKey('Order', on_delete=models.CASCADE)
    file_path = models.CharField(max_length=500)
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    content_type = models.CharField(max_length=100)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL)
    download_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True)
```

## امنیت

### محتوای علمی
- دسترسی عمومی برای خواندن
- فقط Admin می‌تواند آپلود کند

### فایل‌های کاربران
- دسترسی فقط برای صاحب فایل
- محدودیت حجم: 100MB

### فایل‌های تحویلی
- دسترسی فقط برای صاحب سفارش
- لینک‌های دانلود موقت
- قابلیت انقضا
- شمارش دانلود

## Migration

برای اعمال تغییرات در دیتابیس:

```bash
cd backend
python manage.py migrate
```

## نکات مهم

1. **Backup**: همیشه از فایل‌های مهم backup بگیرید
2. **حجم فایل**: حداکثر حجم فایل‌های کاربران 100MB است
3. **انقضا**: فایل‌های تحویلی پیش‌فرض 30 روز اعتبار دارند
4. **CDN**: برای محتوای علمی از CDN Liara استفاده می‌شود

## عیب‌یابی

### خطای عدم دسترسی به S3
```
Error: No Liara credentials available
```
**حل**: مطمئن شوید environment variables تنظیم شده‌اند

### خطای Permission Denied
```
Error: Permission denied creating directory
```
**حل**: دایرکتوری media باید write permission داشته باشد

### خطای حجم فایل
```
Error: حجم فایل نباید بیشتر از 100 مگابایت باشد
```
**حل**: حجم فایل را کاهش دهید یا USER_FILES_MAX_SIZE را افزایش دهید
