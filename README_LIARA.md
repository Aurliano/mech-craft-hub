# 🚀 راهنمای Deployment در Liara - MechCraft Hub

## 📋 مراحل Deployment

### 1. **آماده‌سازی کد**
✅ تمام فایل‌های لازم آماده شده:
- `Procfile` - تنظیمات process
- `requirements.txt` - dependencies
- `runtime.txt` - نسخه Python
- `liara.json` - تنظیمات Liara
- `wsgi.py` - WSGI configuration
- `manage.py` - Django management
- `settings.py` - Django settings
- `urls.py` - URL routing
- `templates/index.html` - Frontend template

### 2. **ایجاد Repository در Git**
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit for Liara deployment"

# Add remote repository (GitHub/GitLab)
git remote add origin https://github.com/yourusername/mech-craft-hub.git

# Push to repository
git push -u origin main
```

### 3. **تنظیمات در Liara Console**

#### **مرحله 1: ایجاد شبکه خصوصی**
1. در پنل Liara، روی **"ساخت شبکه خصوصی جدید"** کلیک کنید
2. نام شبکه را `production` وارد کنید
3. روی **"ایجاد شبکه"** کلیک کنید

#### **مرحله 2: انتخاب پلتفرم**
1. **پلتفرم Python** را انتخاب کنید
2. **منبع کد** را مشخص کنید:
   - اگر از Git استفاده می‌کنید: URL repository را وارد کنید
   - اگر فایل آپلود می‌کنید: فایل ZIP را آپلود کنید

#### **مرحله 3: تنظیمات Environment Variables**
در بخش Environment Variables، متغیرهای زیر را اضافه کنید:

```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-production-key-here
ALLOWED_HOSTS=mech-craft-hub-main.liara.run

# Database (local PostgreSQL on Liara persistent disk - do NOT use DATABASE_URL)
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=mechcraft
POSTGRES_USER=mechcraft
POSTGRES_PASSWORD=your-secure-database-password
PGDATA=/var/lib/postgresql/data
BACKUP_DIR=/app/backups
AUTO_BACKUP=1

# Redis (Liara Redis)
REDIS_URL=redis://username:password@host:port/database

# Email (اختیاری)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Sentry (اختیاری)
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production

# Frontend URL
FRONTEND_URL=https://mech-craft-hub-main.liara.run
```

#### **مرحله 4: انتخاب منابع**
- **پلان پیشنهادی**: مریخ (Mars) - 1 GB RAM
- **پلان پیشرفته**: مشتری (Jupiter) - 2 GB RAM
- **پلان حرفه‌ای**: زحل (Saturn) - 4 GB RAM

### 4. **Deployment**
1. روی **"ایجاد برنامه"** کلیک کنید
2. منتظر بمانید تا build و deployment کامل شود
3. URL برنامه شما: `https://mech-craft-hub-main.liara.run`

## 🔧 تنظیمات اضافی

### **Database Setup (PostgreSQL روی دیسک پایدار)**
1. در Liara Console دو **دیسک** بسازید: `postgres-data` و `db-backups` (طبق [`liara.json`](liara.json))
2. متغیر `DATABASE_URL` را **حذف** کنید (اتصال به `sayda-db` قطع شود)
3. متغیرهای `POSTGRES_*` و `PGDATA` را طبق [`LIARA_DB_MIGRATION.md`](LIARA_DB_MIGRATION.md) تنظیم کنید
4. قبل از deploy: `bash scripts/emergency_db_recovery.sh` در Liara shell برای تلاش نجات داده

### **Redis Setup (اختیاری)**
1. در Liara Console، یک **Redis** ایجاد کنید
2. در بخش **Networks**، آن را به شبکه `production` اضافه کنید
3. متغیر `REDIS_URL` را از اطلاعات Redis کپی کنید

### **Static Files**
Static files به صورت خودکار توسط WhiteNoise serve می‌شوند.

### **Media Files**
برای فایل‌های media، می‌توانید از Liara Object Storage استفاده کنید.

## 🚨 Troubleshooting

### **مشکلات رایج:**

#### **1. Build Error**
```bash
# بررسی logs
liara logs --app mech-craft-hub-main

# بررسی build logs
liara build-logs --app mech-craft-hub-main
```

#### **2. Database Connection Error**
- `DATABASE_URL` نباید در env باشد (باعث اتصال به DB قدیمی می‌شود)
- دیسک‌های `postgres-data` و `db-backups` باید در Liara ساخته و mount شده باشند
- `POSTGRES_PASSWORD` باید در env تنظیم شده باشد
- لاگ startup: `liara logs --app mech-craft-hub-main`

#### **3. Static Files Error**
- بررسی کنید `collectstatic` در build process اجرا شده باشد
- اطمینان حاصل کنید `STATIC_ROOT` صحیح تنظیم شده باشد

#### **4. Frontend Not Loading**
- بررسی کنید `templates/index.html` صحیح باشد
- اطمینان حاصل کنید static files در `dist/` directory موجود باشند

## 📊 Monitoring

### **Logs**
```bash
# View application logs
liara logs --app mech-craft-hub-main

# View build logs
liara build-logs --app mech-craft-hub-main
```

### **Health Check**
- URL: `https://mech-craft-hub-main.liara.run/health/`
- باید response `200 OK` برگرداند

### **API Documentation**
- URL: `https://mech-craft-hub-main.liara.run/api/schema/swagger-ui/`

## 🔄 Updates

### **Deploy New Version**
```bash
# Push changes to repository
git add .
git commit -m "Update application"
git push origin main

# Liara automatically detects changes and redeploys
```

### **Manual Deploy**
```bash
# Deploy specific commit
liara deploy --app mech-craft-hub-main --commit <commit-hash>
```

## 🎉 نتیجه

پس از تکمیل مراحل بالا، برنامه شما در آدرس زیر در دسترس خواهد بود:
**https://mech-craft-hub-main.liara.run**

### **ویژگی‌های فعال:**
- ✅ Frontend React + TypeScript
- ✅ Backend Django + DRF
- ✅ API Documentation
- ✅ Admin Panel
- ✅ Static Files Serving
- ✅ Database Integration
- ✅ Security Headers
- ✅ Error Handling

**موفق باشید! 🚀**
