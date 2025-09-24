# ✅ چک‌لیست Deploy برای لیارا

## 🔍 **بررسی‌های انجام شده**

### ✅ **مشکلات رفع شده:**

1. **❌➡️✅ تناقض پورت**: همه فایل‌ها حالا از پورت 80 استفاده می‌کنند
2. **❌➡️✅ Health Check**: curl نصب شده و health check بهینه شده
3. **❌➡️✅ ALLOWED_HOSTS**: تنظیمات صحیح برای لیارا
4. **❌➡️✅ Dependencies**: تمام packages مورد نیاز اضافه شده
5. **❌➡️✅ INSTALLED_APPS**: تمام apps مورد نیاز اضافه شده
6. **❌➡️✅ Settings**: تنظیمات Spectacular و JWT اضافه شده

### ✅ **فایل‌های آماده:**

- [x] `liara.json` - تنظیمات بهینه
- [x] `Procfile` - دستور شروع بهبود یافته
- [x] `backend/Dockerfile` - پورت و health check اصلاح شده
- [x] `Dockerfile.liara` - Dockerfile بهینه برای لیارا
- [x] `requirements_liara.txt` - dependencies کامل
- [x] `backend/config/settings_ultra_simple.py` - تنظیمات بهینه
- [x] `deploy_liara.sh` - اسکریپت Deploy خودکار
- [x] `LIARA_DEPLOYMENT_GUIDE.md` - راهنمای کامل

## 🚀 **مراحل Deploy**

### **روش 1: خودکار (توصیه شده)**
```bash
./deploy_liara.sh
```

### **روش 2: دستی**
```bash
# 1. کپی Dockerfile بهینه
cp Dockerfile.liara backend/Dockerfile

# 2. تنظیم متغیرهای محیطی در پنل لیارا
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=*.liara.run,*.liara.ir

# 3. Deploy
liara deploy
```

## 🔧 **تنظیمات متغیرهای محیطی در لیارا**

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
DJANGO_SETTINGS_MODULE=config.settings_ultra_simple
PYTHONPATH=/app/backend
ALLOWED_HOSTS=*.liara.run,*.liara.ir
DATABASE_URL=postgresql://user:password@host:port/database
```

## 🏥 **بررسی Health Check**

پس از Deploy:
```bash
curl https://mech-craft-hub-main.liara.run/health/
curl https://mech-craft-hub-main.liara.run/api/health/
```

## 📊 **URLs مهم**

- **App**: `https://mech-craft-hub-main.liara.run`
- **API Docs**: `https://mech-craft-hub-main.liara.run/api/docs/`
- **Admin**: `https://mech-craft-hub-main.liara.run/admin/`
- **Health**: `https://mech-craft-hub-main.liara.run/health/`

## ✅ **وضعیت نهایی**

🎉 **پروژه آماده Deploy است!**

تمام مشکلات شناسایی و رفع شده‌اند:
- ✅ Health Check بهینه
- ✅ تنظیمات پورت صحیح
- ✅ Dependencies کامل
- ✅ Settings بهینه
- ✅ Dockerfile بهینه
- ✅ اسکریپت Deploy آماده