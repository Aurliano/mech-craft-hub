# Mech Craft Hub API - فاز 2

## بهبودهای پیاده‌سازی شده

### 1. Filtering & Search
- **فیلترهای سفارشی** برای تمام ViewSets
- **جستجوی پیشرفته** در فیلدهای مختلف
- **مرتب‌سازی** بر اساس فیلدهای مختلف

#### مثال‌های استفاده:
```bash
# فیلتر سرویس‌ها
GET /api/v1/services/?scope=mechanical&type=design&min_price=100000&max_price=500000

# جستجو در سفارش‌ها
GET /api/v1/orders/?search=ORD-20240101&status=submitted

# مرتب‌سازی
GET /api/v1/services/?ordering=-created_at,base_price
```

### 2. Pagination بهینه‌سازی شده
- **Pagination سفارشی** با اطلاعات کامل
- **قابلیت تنظیم اندازه صفحه**
- **محدودیت حداکثر اندازه صفحه**

#### پاسخ Pagination:
```json
{
  "links": {
    "next": "http://api.example.com/orders/?page=2",
    "previous": null
  },
  "count": 150,
  "total_pages": 8,
  "current_page": 1,
  "page_size": 20,
  "results": [...]
}
```

### 3. API Rate Limiting
- **محدودیت نرخ** برای کاربران مختلف
- **Throttling سفارشی** برای عملیات مختلف
- **محدودیت‌های مختلف** برای عملیات حساس

#### محدودیت‌های Rate:
- **کاربران ناشناس**: 100 درخواست در ساعت
- **کاربران احراز هویت شده**: 1000 درخواست در ساعت
- **آپلود فایل**: 10 درخواست در ساعت
- **ورود به سیستم**: 5 درخواست در دقیقه

### 4. Error Handling بهبود یافته
- **Exception Handler سفارشی** با پیام‌های فارسی
- **کدهای خطای استاندارد** HTTP
- **جزئیات خطا** برای debugging
- **لاگ‌گیری** خودکار خطاها

#### فرمت پاسخ خطا:
```json
{
  "error": true,
  "message": "خطایی رخ داده است",
  "details": "جزئیات خطا",
  "code": 400
}
```

### 5. API Versioning
- **پشتیبانی از چندین نسخه** API
- **Versioning از طریق URL Path**
- **اطلاعات نسخه** در endpoint مخصوص
- **Deprecation warnings** برای نسخه‌های قدیمی

#### Endpoints مربوط به Version:
- `GET /api/version/` - اطلاعات نسخه‌ها
- `GET /api/status/` - وضعیت API

## نحوه استفاده

### نصب Dependencies
```bash
pip install -r requirements.txt
```

### اجرای سرور
```bash
python manage.py runserver
```

### تست API
```bash
# Health Check
curl http://localhost:8000/api/health/

# Version Info
curl http://localhost:8000/api/version/

# API Status
curl http://localhost:8000/api/status/
```

## فیلترهای موجود

### Services
- `scope` - فیلتر بر اساس scope
- `type` - فیلتر بر اساس نوع سرویس
- `is_active` - فیلتر سرویس‌های فعال
- `min_price` / `max_price` - فیلتر بر اساس قیمت

### Orders
- `status` - فیلتر بر اساس وضعیت
- `customer` - فیلتر بر اساس مشتری
- `min_amount` / `max_amount` - فیلتر بر اساس مبلغ
- `created_after` / `created_before` - فیلتر بر اساس تاریخ

### Quotes
- `status` - فیلتر بر اساس وضعیت
- `contractor` - فیلتر بر اساس پیمانکار
- `min_price` / `max_price` - فیلتر بر اساس قیمت
- `min_delivery_days` / `max_delivery_days` - فیلتر بر اساس روزهای تحویل

### Tickets
- `status` - فیلتر بر اساس وضعیت
- `priority` - فیلتر بر اساس اولویت
- `category` - فیلتر بر اساس دسته‌بندی
- `creator` - فیلتر بر اساس ایجادکننده

## جستجو

تمام ViewSets از جستجوی پیشرفته پشتیبانی می‌کنند:

- **Services**: جستجو در نام، توضیحات، و نام scope
- **Orders**: جستجو در شماره سفارش، نام مشتری، و یادداشت‌ها
- **Quotes**: جستجو در نام پیمانکار، یادداشت‌ها، و نام سرویس
- **Tickets**: جستجو در موضوع، نام ایجادکننده، و نام دسته‌بندی

## Rate Limiting

برای جلوگیری از سوء استفاده، محدودیت‌های زیر اعمال شده:

1. **عمومی**: 100 درخواست در ساعت
2. **کاربران**: 1000 درخواست در ساعت
3. **آپلود**: 10 درخواست در ساعت
4. **ورود**: 5 درخواست در دقیقه

## Versioning

API از چندین روش versioning پشتیبانی می‌کند:

1. **URL Path**: `/api/v1/orders/`
2. **Query Parameter**: `/api/orders/?version=v1`
3. **Accept Header**: `Accept: application/json; version=v1`
4. **Namespace**: `/api/v1/orders/`

## نکات مهم

- تمام پاسخ‌ها به زبان فارسی هستند
- Pagination به صورت پیش‌فرض فعال است
- Rate limiting برای تمام endpoints اعمال شده
- Error handling جامع برای تمام خطاها
- Versioning برای سازگاری با نسخه‌های آینده
