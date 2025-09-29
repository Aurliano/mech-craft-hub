# 🌐 راهنمای کامل فعال‌سازی دامنه saydatech.ir

## ✅ مراحل انجام شده

### 1️⃣ **تنظیمات DNS**
- ✅ Nameservers کلودفلیر در ایرنیک اضافه شده
- ✅ رکوردهای DNS در کلودفلیر تنظیم شده
- ✅ پروکسی نارنجی (Proxied) فعال شده

### 2️⃣ **تنظیمات SSL**
- ✅ گواهی SSL در لیارا فعال شده
- ✅ گواهی SSL در کلودفلیر فعال شده
- ✅ HTTPS اجباری شده

### 3️⃣ **تنظیمات Django**
- ✅ دامنه `saydatech.ir` به ALLOWED_HOSTS اضافه شده
- ✅ دامنه `www.saydatech.ir` به ALLOWED_HOSTS اضافه شده
- ✅ تنظیمات CORS به‌روزرسانی شده
- ✅ تنظیمات CSRF به‌روزرسانی شده
- ✅ تنظیمات امنیتی SSL فعال شده

## 🚀 مراحل نهایی

### 1️⃣ **Deploy تنظیمات جدید**
```bash
# در Windows
deploy_domain_update.bat

# یا دستی
liara deploy
```

### 2️⃣ **بررسی در پنل لیارا**
1. وارد پنل لیارا شوید
2. به بخش "Domains" بروید
3. دامنه `saydatech.ir` را اضافه کنید
4. SSL Certificate را فعال کنید
5. HTTPS Redirect را فعال کنید

### 3️⃣ **بررسی در کلودفلیر**
1. وارد پنل کلودفلیر شوید
2. دامنه `saydatech.ir` را انتخاب کنید
3. به بخش "SSL/TLS" بروید
4. "Full (strict)" را انتخاب کنید
5. "Always Use HTTPS" را فعال کنید

## 🧪 تست نهایی

### 1️⃣ **تست دامنه**
```bash
# تست HTTP (باید به HTTPS redirect شود)
curl -I http://saydatech.ir

# تست HTTPS
curl -I https://saydatech.ir

# تست www
curl -I https://www.saydatech.ir
```

### 2️⃣ **تست عملکرد**
```bash
# تست Health Check
curl https://saydatech.ir/health/

# تست API
curl https://saydatech.ir/api/health/

# تست Admin Panel
curl -I https://saydatech.ir/admin/
```

## 🔧 تنظیمات مهم

### **ALLOWED_HOSTS**
```
saydatech.ir
www.saydatech.ir
*.liara.run
*.liara.ir
```

### **CORS_ALLOWED_ORIGINS**
```
https://saydatech.ir
https://www.saydatech.ir
https://sayda-engineering-platform.liara.run
```

### **CSRF_TRUSTED_ORIGINS**
```
https://saydatech.ir
https://www.saydatech.ir
https://sayda-engineering-platform.liara.run
```

## 🛡️ امنیت

### **SSL Settings**
- ✅ SECURE_SSL_REDIRECT = True
- ✅ SESSION_COOKIE_SECURE = True
- ✅ CSRF_COOKIE_SECURE = True
- ✅ HSTS فعال شده (1 سال)
- ✅ Security Headers فعال شده

## 📊 مانیتورینگ

### **Logs**
```bash
liara logs
```

### **Health Check**
- **ساده**: `https://saydatech.ir/health/`
- **کامل**: `https://saydatech.ir/api/health/`

## 🌐 آدرس‌های نهایی

- **وبسایت اصلی**: https://saydatech.ir
- **وبسایت با www**: https://www.saydatech.ir
- **Admin Panel**: https://saydatech.ir/admin/
- **API Docs**: https://saydatech.ir/api/docs/
- **Health Check**: https://saydatech.ir/health/

## 🚨 رفع مشکلات

### **مشکل SSL**
1. بررسی گواهی SSL در لیارا
2. بررسی تنظیمات SSL در کلودفلیر
3. بررسی DNS records

### **مشکل Redirect**
1. بررسی تنظیمات HTTPS در کلودفلیر
2. بررسی تنظیمات Django

### **مشکل CORS**
1. بررسی CORS_ALLOWED_ORIGINS
2. بررسی تنظیمات کلودفلیر

## ✅ چک‌لیست نهایی

- [ ] دامنه در پنل لیارا اضافه شده
- [ ] SSL Certificate فعال شده
- [ ] HTTPS Redirect فعال شده
- [ ] تنظیمات Django Deploy شده
- [ ] دامنه تست شده
- [ ] عملکرد صحیح است
- [ ] امنیت فعال است

---

🎉 **تبریک! دامنه saydatech.ir آماده استفاده است!**
