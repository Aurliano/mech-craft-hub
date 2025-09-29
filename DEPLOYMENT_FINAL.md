# راهنمای دیپلوی نهایی - MechCraft Hub

## 🚀 **آمادگی برای دیپلوی**

### ✅ **مشکلات حل شده:**
1. **مشکل Login** - KeyError: 'user' حل شد
2. **مشکل FallbackCaptcha** - Simple fallback اضافه شد
3. **مشکل Unsplash Images** - با تصاویر محلی جایگزین شد
4. **تنظیمات دیتابیس** - DATABASE_URL اضافه شد

### 🔧 **تنظیمات Environment Variables در Liara:**

#### **1. Database Configuration:**
```bash
DATABASE_URL=postgresql://root:honm5klCHxMeLN9Rd8vkBegF@sayda-db:5432/postgres
```

#### **2. Django Settings:**
```bash
SECRET_KEY=your-super-secret-production-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=mech-craft-hub-main.liara.run
```

#### **3. Email Configuration (Liara SMTP):**
```bash
EMAIL_HOST=smtp.c1.liara.email
EMAIL_PORT=465
EMAIL_USE_TLS=False
EMAIL_USE_SSL=True
EMAIL_HOST_USER=hopeful_zhukovsky_9daqpv
EMAIL_HOST_PASSWORD=fbef30d7-f852-428e-9573-bc73381c7d4d
DEFAULT_FROM_EMAIL=info@example.com

# Liara Email Service (Alternative naming)
MAIL_HOST=smtp.c1.liara.email
MAIL_PORT=465
MAIL_USER=hopeful_zhukovsky_9daqpv
MAIL_PASSWORD=fbef30d7-f852-428e-9573-bc73381c7d4d
MAIL_FROM_ADDRESS=info@example.com
MAIL_FROM_NAME=MechCraft Hub
```

#### **5. Google Gemini AI:**
```bash
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL_NAME=gemini-1.5-flash
```

### 📋 **Environment Variables کامل برای Liara:**

```bash
# Database
DATABASE_URL=postgresql://root:honm5klCHxMeLN9Rd8vkBegF@sayda-db:5432/postgres

# Django Settings
SECRET_KEY=your-super-secret-production-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=mech-craft-hub-main.liara.run

# Cloudflare Turnstile
TURNSTILE_SITE_KEY=your-actual-turnstile-site-key-here
TURNSTILE_SECRET_KEY=your-actual-turnstile-secret-key-here
VITE_TURNSTILE_SITEKEY=your-actual-turnstile-site-key-here

# Email Configuration (Liara SMTP)
EMAIL_HOST=smtp.c1.liara.email
EMAIL_PORT=465
EMAIL_USE_TLS=False
EMAIL_USE_SSL=True
EMAIL_HOST_USER=hopeful_zhukovsky_9daqpv
EMAIL_HOST_PASSWORD=fbef30d7-f852-428e-9573-bc73381c7d4d
DEFAULT_FROM_EMAIL=info@example.com

# Liara Email Service (Alternative naming)
MAIL_HOST=smtp.c1.liara.email
MAIL_PORT=465
MAIL_USER=hopeful_zhukovsky_9daqpv
MAIL_PASSWORD=fbef30d7-f852-428e-9573-bc73381c7d4d
MAIL_FROM_ADDRESS=info@example.com
MAIL_FROM_NAME=MechCraft Hub

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL_NAME=gemini-1.5-flash
```

### 📊 **وضعیت پروژه:**

#### **✅ Frontend:**
- Build موفقیت‌آمیز
- تصاویر محلی
- FallbackCaptcha کار می‌کنه
- Support Widget آماده

#### **✅ Backend:**
- Login مشکل حل شد
- Database connection آماده
- API endpoints کار می‌کنن
- Migrations آماده

#### **✅ Database:**
- PostgreSQL در Liara
- Connection string درست
- Tables آماده

### 🎯 **مراحل دیپلوی:**

#### **1. Environment Variables در Liara:**
```bash
# در Liara Dashboard > Environment Variables اضافه کنید:
DATABASE_URL=postgresql://root:honm5klCHxMeLN9Rd8vkBegF@sayda-db:5432/postgres
SECRET_KEY=your-super-secret-production-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=mech-craft-hub-main.liara.run
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL_NAME=gemini-1.5-flash
```

#### **2. دیپلوی:**
```bash
# در Liara Dashboard > Deploy
# یا از CLI:
liara deploy
```

#### **3. Migrations:**
```bash
# در Liara Console:
python manage.py migrate
```

### 🔍 **تست‌های نهایی:**

#### **1. تست Login:**
- ✅ Captcha نمایش داده می‌شه
- ✅ Login کار می‌کنه
- ✅ Database connection برقراره

#### **2. تست Support Widget:**
- ✅ نمایش داده می‌شه
- ✅ Feedback form کار می‌کنه
- ✅ AI response (اگر API key تنظیم شده)

#### **3. تست Blog:**
- ✅ مقالات نمایش داده می‌شن
- ✅ Database content خوانده می‌شه

### 🎉 **آماده برای Production!**

همه چیز آماده است و می‌تونید دیپلوی کنید! 🚀
