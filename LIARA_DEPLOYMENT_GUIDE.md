# 🚀 راهنمای Deploy پروژه MechCraft Hub در لیارا

## 📋 مراحل Deploy

### 1️⃣ **آماده‌سازی محیط**

```bash
# نصب Liara CLI
npm install -g @liara/cli

# ورود به حساب کاربری لیارا
liara login
```

### 2️⃣ **تنظیم متغیرهای محیطی**

در پنل لیارا، متغیرهای زیر را تنظیم کنید:

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
DJANGO_SETTINGS_MODULE=config.settings_ultra_simple
PYTHONPATH=/app/backend
ALLOWED_HOSTS=*.liara.run,*.liara.ir
DATABASE_URL=postgresql://user:password@host:port/database
```

### 3️⃣ **Deploy خودکار**

```bash
# اجرای اسکریپت Deploy
./deploy_liara.sh
```

### 4️⃣ **Deploy دستی**

```bash
# کپی کردن Dockerfile بهینه
cp Dockerfile.liara backend/Dockerfile

# Deploy به لیارا
liara deploy
```

## 🔧 **تنظیمات مهم**

### **فایل liara.json**
- پورت: `80`
- تنظیمات Gunicorn بهینه شده
- متغیرهای محیطی ضروری

### **فایل Procfile**
- دستور شروع بهینه شده
- تنظیمات Gunicorn برای production

### **Dockerfile.liara**
- Multi-stage build
- Health check بهینه
- Non-root user
- پورت 80

## 🏥 **Health Check**

پروژه دارای دو endpoint برای health check است:

1. **`/health/`** - Health check ساده
2. **`/api/health/`** - Health check کامل با بررسی دیتابیس و cache

## 📊 **مانیتورینگ**

- **Logs**: در پنل لیارا قابل مشاهده
- **Metrics**: `/metrics/` endpoint
- **Health**: `/health/` endpoint

## 🚨 **رفع مشکلات رایج**

### **مشکل Health Check**
```bash
# بررسی وضعیت container
liara logs

# بررسی health endpoint
curl https://your-app.liara.run/health/
```

### **مشکل Static Files**
```bash
# اجرای collectstatic
liara run python manage.py collectstatic --noinput
```

### **مشکل Database**
```bash
# اجرای migrations
liara run python manage.py migrate
```

## 🔐 **امنیت**

- ✅ HTTPS فعال
- ✅ Security headers
- ✅ CORS تنظیم شده
- ✅ Rate limiting
- ✅ Input validation

## 📈 **بهینه‌سازی**

- ✅ Gunicorn با تنظیمات بهینه
- ✅ Static files با WhiteNoise
- ✅ Database connection pooling
- ✅ Caching با Redis

## 🌐 **URLs مهم**

- **App**: `https://mech-craft-hub-main.liara.run`
- **API Docs**: `https://mech-craft-hub-main.liara.run/api/docs/`
- **Admin**: `https://mech-craft-hub-main.liara.run/admin/`
- **Health**: `https://mech-craft-hub-main.liara.run/health/`

## 📞 **پشتیبانی**

در صورت بروز مشکل:
1. بررسی logs در پنل لیارا
2. بررسی health endpoint
3. تماس با تیم پشتیبانی لیارا
