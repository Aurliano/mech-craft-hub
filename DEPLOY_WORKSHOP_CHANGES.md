# راهنمای دیپلوی تغییرات کارگاه (Workshop Changes)

## خلاصه تغییرات

این تغییرات شامل موارد زیر است:
1. ✅ اضافه شدن فیلد `code` به مدل کارگاه
2. ✅ ایجاد کد منحصر به فرد برای هر کارگاه هنگام ثبت
3. ✅ نمایش کارگاه‌های واقعی در صفحه ساخت
4. ✅ استفاده از MultiFileUpload برای آپلود فایل
5. ✅ بهبود responsive بودن صفحات

## مراحل دیپلوی

### 1. بیلد Frontend

```bash
# Build production version
npm run build
```

### 2. اجرای Migration در PostgreSQL

```bash
# SSH به سرور یا اجرا در Docker
cd backend

# Check migration status
python manage.py showmigrations api

# Apply migration
python manage.py migrate

# Verify workshop code field was added
python manage.py dbshell
# Then in PostgreSQL:
# SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'workshops' AND column_name = 'code';
# \q
```

### 3. تولید کد برای کارگاه‌های موجود

Migration به طور خودکار کد برای تمام کارگاه‌های موجود ایجاد می‌کند. اگر مشکلی پیش آمد:

```python
# In Django shell
python manage.py shell

from api.models import Workshop
import random
from uuid import uuid4

for workshop in Workshop.objects.all():
    if not workshop.code:
        # Try 100 times
        for _ in range(100):
            code = f"WS{random.randint(100000, 999999)}"
            if not Workshop.objects.filter(code=code).exists():
                workshop.code = code
                workshop.save(update_fields=['code'])
                break
        else:
            # Fallback to UUID
            workshop.code = f"WS{uuid4().hex[:6].upper()}"
            workshop.save(update_fields=['code'])
```

### 4. دیپلوی

```bash
# Copy build files
cp -r dist/* /var/www/html/

# Reload Nginx
sudo systemctl reload nginx
# or if using Docker:
docker restart nginx-container

# Restart Django (if using systemd)
sudo systemctl restart gunicorn
# or if using Docker:
docker restart django-container
```

## بررسی پس از دیپلوی

### 1. بررسی API

```bash
# Test public workshops endpoint
curl https://saydatech.ir/api/v1/public/workshops/

# Should return JSON with workshop data including 'code' field
```

### 2. بررسی Frontend

1. باز کردن https://saydatech.ir/manufacturing
2. در بخش "کارگاه های طرف قرارداد" باید کارگاه‌های واقعی با کدهایشان نمایش داده شوند
3. آزمودن افزودن کارگاه از داشبورد پیمانکار
4. بررسی چندفایلی بودن آپلود

## نکات مهم برای Production

### PostgreSQL Compatibility

✅ Migration به درستی برای PostgreSQL نوشته شده است
✅ استفاده از `save(update_fields=['code'])` برای بهینه‌سازی
✅ مدیریت `race condition` با حداکثر 100 تلاش
✅ Fallback به UUID در صورت نیاز

### Security

✅ کارگاه‌های واقعی در API عمومی فقط اطلاعات عمومی را برمی‌گردانند
✅ اطلاعات حساس (آدرس پستی، اطلاعات مدیر) نمایش داده نمی‌شوند
✅ MultiFileUpload محدودیت حجم فایل دارد (200MB per file)

### Performance

✅ استفاده از `update_fields` برای کاهش عملیات دیتابیس
✅ استفاده از set برای ذخیره کدهای استفاده شده
✅ چک محدود به 100 تلاش برای جلوگیری از حلقه بی‌نهایت

## Rollback (در صورت نیاز)

רק در حالت اضطراری:

```bash
# Revert migration
python manage.py migrate api 0025_add_workforce_models

# Remove code column manually if needed
python manage.py dbshell
ALTER TABLE workshops DROP COLUMN code;
```

## Testing Checklist

- [ ] Migration اجرا شد بدون خطا
- [ ] کارگاه‌های موجود کد دارند
- [ ] کارگاه جدید با کد منحصر به فرد ساخته می‌شود
- [ ] صفحه Manufacturing کارگاه‌های واقعی را نمایش می‌دهد
- [ ] کدهای کارگاه نمایش داده می‌شوند
- [ ] اطلاعات حساس نمایش داده نمی‌شوند
- [ ] MultiFileUpload کار می‌کند
- [ ] Responsive بودن صفحات در موبایل تست شده

## تغییرات فایل‌ها

### Backend
- `backend/api/models.py` - اضافه شدن فیلد code و save method
- `backend/api/views.py` - اضافه شدن endpoint عمومی
- `backend/api/urls.py` - اضافه شدن route
- `backend/api/migrations/0026_workshop_code.py` - Migration جدید

### Frontend
- `src/pages/Manufacturing.tsx` - استفاده از MultiFileUpload و نمایش کارگاه‌های واقعی
- `src/pages/MyWorkshops.tsx` - نمایش کد کارگاه
- `src/pages/Dashboard.tsx` - اضافه شدن Footer
- `src/pages/ContractorDashboard.tsx` - اضافه شدن Footer
- `src/lib/api.ts` - اضافه شدن تابع getPublicWorkshops

## پشتیبانی

در صورت بروز مشکل:
1. بررسی لاگ‌های Django: `journalctl -u gunicorn -n 100`
2. بررسی لاگ‌های Nginx: `tail -f /var/log/nginx/error.log`
3. بررسی migration status: `python manage.py showmigrations`

