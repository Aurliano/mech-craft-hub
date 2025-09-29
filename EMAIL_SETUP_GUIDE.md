# راهنمای تنظیم سرویس ایمیل Liara

## 📧 **تنظیم ایمیل برای Production:**

### **1. دریافت اطلاعات ایمیل از Liara:**
```
1. به https://console.liara.ir بروید
2. روی "Email" کلیک کنید
3. سرویس ایمیل خود را انتخاب کنید
4. اطلاعات زیر را کپی کنید:
   - Username
   - Password
   - Host: smtp.c1.liara.email
   - Port: 465
```

### **2. تنظیم در Liara Dashboard:**

#### **Environment Variables:**
```bash
# Email Configuration (Liara SMTP)
EMAIL_HOST=smtp.c1.liara.email
EMAIL_PORT=465
EMAIL_USE_TLS=False
EMAIL_USE_SSL=True
EMAIL_HOST_USER=your-liara-email-username
EMAIL_HOST_PASSWORD=your-liara-email-password
DEFAULT_FROM_EMAIL=noreply@mech-craft-hub-main.liara.run
```

### **3. کاربردهای ایمیل:**

#### **✅ فراموشی رمز عبور:**
- کاربر روی "فراموشی رمز عبور" کلیک می‌کند
- ایمیل با لینک reset ارسال می‌شود
- کاربر رمز جدید تنظیم می‌کند

#### **✅ تایید ایمیل:**
- کاربر ثبت نام می‌کند
- ایمیل تایید ارسال می‌شود
- کاربر روی لینک کلیک می‌کند

### **4. تنظیمات فنی:**

#### **🔒 امنیت:**
- **SSL**: True (پورت 465)
- **TLS**: False (SSL استفاده می‌شود)
- **Authentication**: Username/Password

#### **📧 تنظیمات:**
- **Host**: smtp.c1.liara.email
- **Port**: 465
- **From Email**: noreply@mech-craft-hub-main.liara.run

### **5. تست ایمیل:**

#### **✅ تست فراموشی رمز:**
```
1. به صفحه Login بروید
2. روی "فراموشی رمز عبور" کلیک کنید
3. ایمیل خود را وارد کنید
4. ایمیل reset دریافت کنید
```

#### **✅ تست تایید ایمیل:**
```
1. ثبت نام جدید انجام دهید
2. ایمیل تایید دریافت کنید
3. روی لینک کلیک کنید
```

### **6. عیب‌یابی:**

#### **اگر ایمیل ارسال نمی‌شود:**
1. بررسی کنید Username/Password درست باشد
2. بررسی کنید Host و Port درست باشد
3. بررسی کنید SSL تنظیم شده باشد
4. Console logs را بررسی کنید

#### **اگر ایمیل در Spam می‌رود:**
1. SPF Record تنظیم کنید
2. DKIM تنظیم کنید
3. DMARC تنظیم کنید

### **7. Environment Variables کامل:**

```bash
# Database
DATABASE_URL=postgresql://root:honm5klCHxMeLN9Rd8vkBegF@sayda-db:5432/postgres

# Django Settings
SECRET_KEY=your-super-secret-production-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=mech-craft-hub-main.liara.run

# Email Configuration (Liara SMTP)
EMAIL_HOST=smtp.c1.liara.email
EMAIL_PORT=465
EMAIL_USE_TLS=False
EMAIL_USE_SSL=True
EMAIL_HOST_USER=your-liara-email-username
EMAIL_HOST_PASSWORD=your-liara-email-password
DEFAULT_FROM_EMAIL=noreply@mech-craft-hub-main.liara.run

# Cloudflare Turnstile
TURNSTILE_SITE_KEY=your-actual-turnstile-site-key-here
TURNSTILE_SECRET_KEY=your-actual-turnstile-secret-key-here
VITE_TURNSTILE_SITEKEY=your-actual-turnstile-site-key-here

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL_NAME=gemini-1.5-flash
```

## 🚀 **آماده برای استفاده!**

پس از تنظیم ایمیل، سیستم فراموشی رمز و تایید ایمیل کار خواهد کرد!
