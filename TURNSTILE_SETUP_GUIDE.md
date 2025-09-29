# راهنمای تنظیم Cloudflare Turnstile

## 🔐 **مراحل تنظیم Turnstile:**

### **1. دریافت Keys از Cloudflare:**
1. به [Cloudflare Dashboard](https://dash.cloudflare.com/) بروید
2. **Turnstile** را انتخاب کنید
3. **Add Site** کلیک کنید
4. Domain خود را وارد کنید: `mech-craft-hub-main.liara.run`
5. **Create** کلیک کنید
6. **Site Key** و **Secret Key** را کپی کنید

### **2. تنظیم در Liara:**

#### **در Liara Dashboard:**
1. به پروژه خود بروید
2. **Environment Variables** را انتخاب کنید
3. متغیرهای زیر را اضافه کنید:

```bash
# Cloudflare Turnstile
TURNSTILE_SITE_KEY=0x4AAAAAAABkMYinukE8nzYr
TURNSTILE_SECRET_KEY=0x4AAAAAAABkMYinukE8nzYr_secret_key
VITE_TURNSTILE_SITEKEY=0x4AAAAAAABkMYinukE8nzYr
```

### **3. مثال کامل Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://root:honm5klCHxMeLN9Rd8vkBegF@sayda-db:5432/postgres

# Django Settings
SECRET_KEY=your-super-secret-production-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=mech-craft-hub-main.liara.run

# Cloudflare Turnstile
TURNSTILE_SITE_KEY=0x4AAAAAAABkMYinukE8nzYr
TURNSTILE_SECRET_KEY=0x4AAAAAAABkMYinukE8nzYr_secret_key
VITE_TURNSTILE_SITEKEY=0x4AAAAAAABkMYinukE8nzYr

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL_NAME=gemini-1.5-flash
```

### **4. تست Turnstile:**

#### **✅ اگر Turnstile کار کند:**
- Captcha کلودفلیر نمایش داده می‌شود
- کاربر باید روی checkbox کلیک کند

#### **✅ اگر Turnstile کار نکند:**
- FallbackCaptcha نمایش داده می‌شود
- سوال ریاضی ساده: `2 + 3 = ?`

### **5. نکات مهم:**

#### **🔒 امنیت:**
- **Secret Key** را هرگز در frontend قرار ندهید
- فقط **Site Key** در frontend استفاده می‌شود
- **Secret Key** فقط در backend استفاده می‌شود

#### **🌐 Domain:**
- Domain در Turnstile باید دقیقاً `mech-craft-hub-main.liara.run` باشد
- اگر domain تغییر کرد، باید در Turnstile هم تغییر دهید

### **6. عیب‌یابی:**

#### **اگر Turnstile نمایش داده نمی‌شود:**
1. بررسی کنید Site Key درست باشد
2. بررسی کنید Domain در Turnstile درست باشد
3. Console browser را بررسی کنید
4. FallbackCaptcha باید کار کند

#### **اگر FallbackCaptcha نمایش داده نمی‌شود:**
1. بررسی کنید `VITE_TURNSTILE_SITEKEY` تنظیم شده باشد
2. Console browser را بررسی کنید
3. Simple challenge باید نمایش داده شود

## 🚀 **آماده برای استفاده!**

پس از تنظیم Keys، Turnstile به صورت خودکار کار خواهد کرد!
