# راهنمای ساخت و انتشار اپلیکیشن سایدا

## پیش‌نیازها

1. نصب Node.js (v18 یا بالاتر)
2. نصب Expo CLI: `npm install -g expo-cli eas-cli`
3. حساب Expo (رایگان): https://expo.dev
4. حساب Google Play Developer (25 دلار یکبار)
5. حساب بازار و مایکت (رایگان)

## نصب Dependencies

```bash
cd saida-mobile
npm install
```

## ساخت برای Android

### 1. ساخت APK برای تست

```bash
eas build --platform android --profile preview
```

یا با Expo CLI:

```bash
expo build:android -t apk
```

### 2. ساخت App Bundle برای Google Play

```bash
eas build --platform android --profile production
```

## تنظیمات قبل از ساخت

### 1. به‌روزرسانی app.json

- `version`: نسخه اپلیکیشن
- `android.versionCode`: شماره نسخه برای Android (باید هر بار افزایش یابد)
- `package`: شناسه بسته Android (ir.saydatech.saida)

### 2. ساخت آیکون و Splash Screen

```bash
# نصب expo-cli
npm install -g expo-cli

# ساخت آیکون‌ها
npx expo install @expo/vector-icons
```

آیکون‌ها باید در پوشه `assets/` قرار گیرند:
- `icon.png`: 1024x1024
- `adaptive-icon.png`: 1024x1024
- `splash.png`: 1242x2436

### 3. تنظیم Google Services (برای Push Notifications)

1. ایجاد پروژه Firebase
2. اضافه کردن Android app
3. دانلود `google-services.json`
4. قرار دادن در ریشه پروژه

## انتشار در Google Play

1. ورود به [Google Play Console](https://play.google.com/console)
2. ایجاد اپلیکیشن جدید
3. آپلود AAB (App Bundle)
4. تکمیل اطلاعات:
   - تصاویر (حداقل 2 اسکرین‌شات)
   - توضیحات
   - Privacy Policy
   - آیکون و گرافیک
5. ارسال برای بررسی

## انتشار در بازار (Bazaar)

1. ورود به [بازار](https://bazaar.ir)
2. ثبت‌نام و تایید هویت
3. آپلود APK
4. تکمیل اطلاعات
5. ارسال برای بررسی

## انتشار در مایکت (Myket)

1. ورود به [مایکت](https://myket.ir)
2. ثبت‌نام
3. آپلود APK
4. تکمیل اطلاعات
5. ارسال برای بررسی

## تست قبل از انتشار

1. تست روی دستگاه‌های مختلف Android
2. تست تمام قابلیت‌ها
3. تست اتصال به API
4. تست پرداخت
5. تست اعلان‌ها

## نکات مهم

- هر بار که نسخه جدید می‌سازید، `versionCode` را افزایش دهید
- قبل از انتشار، تمام تست‌ها را انجام دهید
- Privacy Policy را در وبسایت قرار دهید و لینک آن را در استورها بگذارید
- برای به‌روزرسانی‌های بعدی، فقط AAB/APK جدید را آپلود کنید

