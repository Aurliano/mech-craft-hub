# راهنمای کامل اضافه کردن Environment Variables در Liara

## 🔐 **مراحل اضافه کردن کلیدها:**

### **1. دسترسی به Liara Dashboard:**
```
1. به https://console.liara.ir بروید
2. وارد حساب کاربری خود شوید
3. پروژه MechCraft Hub را انتخاب کنید
4. روی "Environment Variables" کلیک کنید
5. روی "Add Variable" کلیک کنید
```

### **2. متغیرهای مورد نیاز:**

#### **🔑 Database:**
```
Variable Name: DATABASE_URL
Value: postgresql://root:honm5klCHxMeLN9Rd8vkBegF@sayda-db:5432/postgres
```

#### **🔑 Django Settings:**
```
Variable Name: SECRET_KEY
Value: your-super-secret-production-key-here-change-this

Variable Name: DEBUG
Value: False

Variable Name: ALLOWED_HOSTS
Value: mech-craft-hub-main.liara.run
```

#### **🔑 Cloudflare Turnstile:**
```
Variable Name: TURNSTILE_SITE_KEY
Value: your-actual-turnstile-site-key-here

Variable Name: TURNSTILE_SECRET_KEY
Value: your-actual-turnstile-secret-key-here

Variable Name: VITE_TURNSTILE_SITEKEY
Value: your-actual-turnstile-site-key-here
```

#### **🔑 Google Gemini AI:**
```
Variable Name: GEMINI_API_KEY
Value: your-gemini-api-key-here

Variable Name: GEMINI_MODEL_NAME
Value: gemini-1.5-flash
```

### **3. نکات مهم:**

#### **✅ امنیت:**
- **هرگز** کلیدها را در کد قرار ندهید
- **هرگز** کلیدها را در Git commit نکنید
- فقط در Liara Dashboard اضافه کنید

#### **✅ فایل‌های محافظت شده:**
- `.env` در `.gitignore` است ✅
- `env.production` فقط template است ✅
- کلیدهای واقعی فقط در Liara هستند ✅

### **4. مثال کامل Environment Variables:**

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

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL_NAME=gemini-1.5-flash
```

### **5. مراحل دیپلوی:**

#### **1. اضافه کردن Environment Variables:**
- همه متغیرهای بالا را در Liara Dashboard اضافه کنید

#### **2. دیپلوی:**
- روی "Deploy" کلیک کنید
- یا از CLI: `liara deploy`

#### **3. Migrations:**
- در Liara Console: `python manage.py migrate`

### **6. تست:**

#### **✅ اگر همه چیز درست باشد:**
- سایت در `https://mech-craft-hub-main.liara.run` کار می‌کند
- Login با Captcha کار می‌کند
- Support Widget کار می‌کند
- Blog از Database خوانده می‌شود

## 🚀 **آماده برای Production!**

پس از اضافه کردن همه Environment Variables، سایت آماده استفاده است!
