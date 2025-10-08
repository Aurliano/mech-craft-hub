# راهنمای سامانه پیامکی SMS.ir

این راهنما نحوه استفاده از سامانه پیامکی پیاده‌سازی شده در پروژه مک کرفت هاب را توضیح می‌دهد.

## تنظیمات اولیه

### 1. متغیرهای محیطی

در فایل `.env` یا تنظیمات سرور، متغیرهای زیر را اضافه کنید:

```bash
# کلید API سامانه پیامکی SMS.ir
SMS_KEY=your_sms_ir_api_key_here

# شناسه قالب برای کد تأیید (اختیاری)
SMS_TEMPLATE_ID_VERIFICATION=100000

# شناسه قالب برای بازیابی رمز عبور (اختیاری)
SMS_TEMPLATE_ID_PASSWORD_RESET=100001
```

### 2. دریافت کلید API

1. به پنل SMS.ir مراجعه کنید
2. در بخش "برنامه‌نویسان" کلید API خود را دریافت کنید
3. کلید را در متغیر `SMS_KEY` قرار دهید

## API Endpoints

### 1. درخواست کد تأیید شماره تلفن

**POST** `/api/v1/auth/phone-verification-request/`

```json
{
  "phone": "09123456789"
}
```

**پاسخ:**
```json
{
  "detail": "کد تأیید ارسال شد",
  "expires_in": 120,
  "message_id": "12345678"
}
```

### 2. تأیید کد شماره تلفن

**POST** `/api/v1/auth/phone-verification-confirm/`

```json
{
  "phone": "09123456789",
  "code": "123456"
}
```

**پاسخ:**
```json
{
  "detail": "شماره تلفن تأیید شد"
}
```

### 3. درخواست بازیابی رمز عبور با پیامک

**POST** `/api/v1/auth/password-reset-request-sms/`

```json
{
  "email": "user@example.com"
}
```

**پاسخ:**
```json
{
  "detail": "کد بازیابی رمز عبور ارسال شد",
  "expires_in": 600,
  "message_id": "12345678"
}
```

### 4. تأیید شماره تلفن کاربر احراز هویت شده

**POST** `/api/v1/auth/verify-user-phone/`

```json
{
  "phone": "09123456789"
}
```

**پاسخ:**
```json
{
  "detail": "کد تأیید ارسال شد",
  "expires_in": 120,
  "message_id": "12345678"
}
```

### 5. بررسی اعتبار پیامک (فقط ادمین)

**GET** `/api/v1/sms/credit/`

**پاسخ:**
```json
{
  "credit": 1500.5,
  "message": "اعتبار دریافت شد"
}
```

## استفاده در Frontend

### 1. صفحه تأیید شماره تلفن

```tsx
import PhoneVerification from './pages/PhoneVerification';

// برای ثبت نام
<PhoneVerification mode="register" />

// برای بازیابی رمز عبور
<PhoneVerification mode="reset" />

// برای تأیید شماره تلفن کاربر
<PhoneVerification mode="verify" />
```

### 2. صفحه بازیابی رمز عبور با پیامک

```tsx
import PasswordResetSMS from './pages/PasswordResetSMS';

<PasswordResetSMS />
```

### 3. نمایش اعتبار پیامک

```tsx
import SMSCredit from './components/SMSCredit';

// در پنل ادمین
<SMSCredit className="mb-4" />
```

## ویژگی‌های امنیتی

### 1. Rate Limiting

- **تأیید شماره تلفن**: حداکثر یک درخواست در هر 5 دقیقه
- **بازیابی رمز عبور**: حداکثر یک درخواست در هر 10 دقیقه

### 2. انقضای کدها

- **کد تأیید**: 2 دقیقه
- **کد بازیابی رمز عبور**: 10 دقیقه

### 3. محدودیت‌های استفاده

- کدها فقط یک بار قابل استفاده هستند
- پس از استفاده، کد غیرفعال می‌شود
- کدهای منقضی شده قابل استفاده نیستند

## مدیریت خطاها

### کدهای خطای رایج

- **400**: کد تأیید نامعتبر یا منقضی شده
- **429**: درخواست بیش از حد مجاز
- **500**: خطا در سرویس پیامک

### نمونه مدیریت خطا

```tsx
try {
  const response = await phoneVerificationRequest(phone);
  // موفقیت
} catch (error) {
  if (error.message.includes('429')) {
    // نمایش پیام "لطفاً چند دقیقه صبر کنید"
  } else {
    // نمایش پیام خطای عمومی
  }
}
```

## تست در محیط توسعه

در محیط توسعه، کد تأیید در کنسول مرورگر نمایش داده می‌شود:

```javascript
console.log('Verification code (development):', code);
```

## پیکربندی قالب‌های پیامک

### 1. ایجاد قالب در پنل SMS.ir

1. وارد پنل SMS.ir شوید
2. به بخش "ارسال سریع" بروید
3. قالب جدید ایجاد کنید
4. شناسه قالب را در تنظیمات قرار دهید

### 2. نمونه قالب

```
کد تأیید شما: #Code#
این کد تا 2 دقیقه معتبر است.
مک کرفت هاب
```

## مانیتورینگ

### 1. لاگ‌ها

تمام درخواست‌های پیامک در فایل لاگ ثبت می‌شوند:

```
backend/logs/django.log
```

### 2. بررسی اعتبار

از endpoint `/api/v1/sms/credit/` برای بررسی اعتبار استفاده کنید.

## عیب‌یابی

### مشکلات رایج

1. **خطای احراز هویت**: کلید API را بررسی کنید
2. **عدم ارسال پیامک**: شماره تلفن را بررسی کنید
3. **خطای قالب**: شناسه قالب را بررسی کنید

### بررسی وضعیت سرویس

```bash
# بررسی لاگ‌ها
tail -f backend/logs/django.log | grep SMS

# بررسی اعتبار
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://saydatech.ir/api/v1/sms/credit/
```

## پشتیبانی

برای پشتیبانی فنی با تیم توسعه تماس بگیرید.
