# راهنمای راه‌اندازی Cloudflare Turnstile

## مرحله 1: دریافت کلیدهای Turnstile

1. **وارد پنل Cloudflare شوید**: https://dash.cloudflare.com/
2. **به بخش Turnstile بروید**: در منوی کناری، "Turnstile" را انتخاب کنید
3. **سایت جدید اضافه کنید**: روی "Add site" کلیک کنید
4. **اطلاعات سایت را وارد کنید**:
   - Site name: نام پروژه شما (مثل "MechCraft Hub")
   - Domain: دامنه سایت شما (برای development: `localhost` یا `127.0.0.1`)
5. **تنظیمات را انتخاب کنید**:
   - Widget mode: Managed (پیشنهادی)
   - Pre-clearance: فعال کنید اگر می‌خواهید
6. **سایت را ایجاد کنید** و SITE_KEY و SECRET_KEY را کپی کنید

## مرحله 2: تنظیم متغیرهای محیطی

### Frontend (.env)
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
```

### Backend (.env)
```env
TURNSTILE_SITE_KEY=your_turnstile_site_key_here
TURNSTILE_SECRET=your_turnstile_secret_here
TURNSTILE_VERIFY_URL=https://challenges.cloudflare.com/turnstile/v0/siteverify
TURNSTILE_FALLBACK_LOCAL=True
```

## مرحله 3: استفاده در کد

### در کامپوننت‌های React:
```tsx
import { TurnstileComponent } from '@/components/Turnstile';
import { useTurnstile } from '@/hooks/useTurnstile';

const MyComponent = () => {
  const { config, getConfig } = useTurnstile();
  
  useEffect(() => {
    getConfig();
  }, [getConfig]);

  const handleVerify = (token: string) => {
    // ارسال token به backend
    console.log('Turnstile token:', token);
  };

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <TurnstileComponent
      siteKey={config.siteKey}
      onVerify={handleVerify}
      fallbackAvailable={config.fallbackAvailable}
    />
  );
};
```

### در API calls:
```tsx
import { api } from '@/lib/api';

// برای ثبت‌نام
const registerData = {
  username: 'user',
  email: 'user@example.com',
  password: 'password',
  turnstile_token: token // از Turnstile component
};

await api.registerWithTurnstile(registerData);

// برای ورود
const loginData = {
  username: 'user',
  password: 'password',
  turnstile_token: token // از Turnstile component
};

await api.loginWithTurnstile(loginData);
```

## ویژگی‌های پیاده‌سازی شده

### Backend:
- ✅ مدل `TurnstileAttempt` برای ثبت تلاش‌ها
- ✅ تابع `verify_turnstile_token_sync` برای تایید token
- ✅ سیستم fallback captcha محلی
- ✅ API endpoints برای آمار و مدیریت
- ✅ Logging و audit trail

### Frontend:
- ✅ کامپوننت `TurnstileComponent` برای نمایش widget
- ✅ Hook `useTurnstile` برای مدیریت state
- ✅ پشتیبانی از fallback captcha
- ✅ Error handling و retry logic

## API Endpoints

### Authentication:
- `POST /api/v1/auth/register/` - ثبت‌نام با Turnstile
- `POST /api/v1/auth/login/` - ورود با Turnstile

### Fallback Captcha:
- `GET /api/v1/captcha/fallback/` - دریافت challenge
- `POST /api/v1/captcha/fallback/verify/` - تایید پاسخ

### Admin:
- `GET /api/v1/admin/turnstile/stats/` - آمار Turnstile
- `GET /api/v1/admin/turnstile/attempts/` - لیست تلاش‌ها

## نکات مهم

1. **امنیت**: SECRET_KEY را هرگز در frontend قرار ندهید
2. **Domain**: مطمئن شوید domain در Turnstile dashboard درست تنظیم شده
3. **Fallback**: سیستم fallback captcha برای مواقعی که Turnstile در دسترس نیست
4. **Testing**: در development mode، اگر SECRET تنظیم نشده باشد، verification skip می‌شود

## عیب‌یابی

### خطای "Invalid site key":
- بررسی کنید SITE_KEY درست کپی شده باشد
- مطمئن شوید domain در Turnstile dashboard درست تنظیم شده

### خطای "Failed to load Turnstile script":
- بررسی کنید اتصال اینترنت
- ممکن است فیلتر یا proxy مانع بارگذاری شود

### خطای "Token verification failed":
- بررسی کنید SECRET_KEY در backend درست تنظیم شده باشد
- بررسی کنید token منقضی نشده باشد (2 دقیقه اعتبار دارد)
