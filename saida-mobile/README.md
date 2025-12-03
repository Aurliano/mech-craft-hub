# سایدا - اپلیکیشن موبایل

اپلیکیشن موبایل پلتفرم سایدا برای Android و iOS

## ویژگی‌ها

- ✅ احراز هویت کامل (ورود، ثبت نام، بازیابی رمز عبور)
- ✅ داشبورد برای مشتری، پیمانکار و متخصص
- ✅ مدیریت سفارش‌ها
- ✅ سبد خرید
- ✅ مدیریت فایل (آپلود، نمایش، دانلود)
- ✅ پرداخت آنلاین
- ✅ اعلان‌های Push
- ✅ UI/UX مشابه وبسایت

## نصب و راه‌اندازی

### پیش‌نیازها

- Node.js (v18 یا بالاتر)
- npm یا yarn
- Expo CLI: `npm install -g expo-cli eas-cli`
- Android Studio (برای Android) یا Xcode (برای iOS)

### نصب Dependencies

```bash
npm install
```

یا

```bash
yarn install
```

### تنظیمات

1. فایل `.env` را از `.env.example` کپی کنید:

```bash
cp .env.example .env
```

2. مقادیر را با اطلاعات خود پر کنید:

```env
EXPO_PUBLIC_API_BASE_URL=https://saydatech.ir
EXPO_PUBLIC_API_ROOT=/api
EXPO_PROJECT_ID=your-project-id
```

### اجرای اپلیکیشن

```bash
# اجرای در development mode
npm start

# اجرای روی Android
npm run android

# اجرای روی iOS
npm run ios
```

## ساختار پروژه

```
saida-mobile/
├── app/                    # صفحات اصلی (Expo Router)
│   ├── (auth)/            # صفحات احراز هویت
│   ├── (customer)/        # صفحات مشتری
│   ├── (contractor)/      # صفحات پیمانکار
│   ├── (specialist)/      # صفحات متخصص
│   └── (public)/          # صفحات عمومی
├── components/            # کامپوننت‌های قابل استفاده مجدد
│   └── ui/                # کامپوننت‌های UI پایه
├── lib/                   # منطق مشترک
│   ├── api.ts            # API Client
│   ├── storage.ts        # مدیریت ذخیره‌سازی
│   ├── fileManager.ts    # مدیریت فایل
│   ├── payment.ts        # پرداخت
│   └── notifications.ts  # اعلان‌ها
├── contexts/             # Context providers
│   └── AuthContext.tsx   # Context احراز هویت
├── hooks/                # Custom hooks
│   └── useAuth.ts        # Hooks احراز هویت
├── navigation/           # Navigation
│   └── AppNavigator.tsx  # Navigator اصلی
├── theme/                # Design System
│   ├── colors.ts         # رنگ‌ها
│   ├── typography.ts     # تایپوگرافی
│   ├── spacing.ts        # فاصله‌گذاری
│   └── index.ts         # Export اصلی
└── assets/              # تصاویر و فونت‌ها
```

## API Integration

اپلیکیشن به بک‌اند Django REST Framework متصل می‌شود. تمام API calls از طریق `lib/api.ts` انجام می‌شود.

### Authentication

- JWT tokens در `SecureStore` ذخیره می‌شوند
- Refresh token به صورت خودکار انجام می‌شود
- در صورت انقضای token، کاربر به صفحه ورود هدایت می‌شود

## Design System

Design System مشابه وبسایت با استفاده از:
- رنگ‌های یکسان
- تایپوگرافی مشابه
- کامپوننت‌های UI سازگار

## ساخت برای انتشار

برای راهنمای کامل ساخت و انتشار، فایل [BUILD_GUIDE.md](./BUILD_GUIDE.md) را مطالعه کنید.

### ساخت APK

```bash
eas build --platform android --profile preview
```

### ساخت App Bundle برای Google Play

```bash
eas build --platform android --profile production
```

## تست

قبل از انتشار، اپلیکیشن را روی دستگاه‌های مختلف تست کنید:

1. تست عملکرد
2. تست UI/UX
3. تست اتصال به API
4. تست پرداخت
5. تست اعلان‌ها

## انتشار

اپلیکیشن را می‌توانید در استورهای زیر منتشر کنید:

- Google Play Store
- بازار (Bazaar)
- مایکت (Myket)

برای راهنمای انتشار، [BUILD_GUIDE.md](./BUILD_GUIDE.md) را ببینید.

## پشتیبانی iOS

همان کدبیس برای iOS نیز کار می‌کند. فقط نیاز به:
- Mac و Xcode
- Apple Developer Account
- تنظیمات iOS-specific

## نکات مهم

- تمام API calls باید از طریق HTTPS انجام شوند
- Tokens در SecureStore ذخیره می‌شوند
- برای production، حتما `EXPO_PUBLIC_API_BASE_URL` را تنظیم کنید

## توسعه بیشتر

برای افزودن قابلیت‌های جدید:

1. API endpoint را در `lib/api.ts` اضافه کنید
2. Hook مربوطه را در `hooks/` ایجاد کنید
3. Screen را در `app/` اضافه کنید
4. Navigation را در `navigation/AppNavigator.tsx` به‌روز کنید

## مجوز

این پروژه متعلق به سایدا است.
