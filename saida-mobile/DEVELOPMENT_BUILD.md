# راهنمای ساخت Development Build

## مشکل Worklets Version Mismatch

خطای `[Worklets] Mismatch between JavaScript part and native part of Worklets (0.7.1 vs 0.5.1)` به این معنی است که:

- **نسخه JavaScript Worklets** در پروژه شما: **0.7.1**
- **نسخه Native Worklets** در Expo Go روی گوشی شما: **0.5.1**

این عدم تطابق باعث می‌شود که اپلیکیشن کرش کند.

## راه‌حل: ساخت Development Build

Development Build یک نسخه سفارشی از اپلیکیشن است که شامل تمام ماژول‌های Native پروژه شماست و تضمین می‌کند که نسخه‌های JavaScript و Native با هم مطابقت دارند.

### پیش‌نیازها

1. **Android Studio** نصب شده باشد
2. **Android SDK** تنظیم شده باشد
3. **Java JDK** نصب شده باشد

### مراحل ساخت Development Build

#### گزینه 1: ساخت با EAS Build (توصیه می‌شود - نیاز به اینترنت)

```bash
# نصب EAS CLI (اگر نصب نشده)
npm install -g eas-cli

# ورود به حساب Expo
eas login

# ساخت Development Build برای Android
eas build --profile development --platform android
```

این دستور یک APK می‌سازد که می‌توانید آن را دانلود و روی گوشی نصب کنید.

#### گزینه 2: ساخت محلی (نیاز به Android SDK)

```bash
# نصب expo-dev-client
npx expo install expo-dev-client

# ساخت و نصب روی دستگاه متصل
npx expo run:android
```

این دستور:
1. یک Development Build می‌سازد
2. آن را روی دستگاه Android متصل (یا emulator) نصب می‌کند
3. Metro bundler را راه‌اندازی می‌کند

### استفاده از Development Build

پس از نصب Development Build:

1. اپلیکیشن را از لیست اپلیکیشن‌های گوشی باز کن
2. Metro bundler را اجرا کن: `npm start`
3. QR code را اسکن کن یا URL را وارد کن

### مزایای Development Build

- ✅ نسخه‌های Native و JavaScript هماهنگ هستند
- ✅ تمام ماژول‌های Native پروژه شما شامل می‌شوند
- ✅ Hot Reload و Fast Refresh کار می‌کنند
- ✅ می‌توانید از Expo Go استفاده نکنید

### نکات مهم

- Development Build فقط برای تست و توسعه است
- برای انتشار در استورها، باید Production Build بسازی
- Development Build بزرگتر از Expo Go است (چون شامل ماژول‌های Native شماست)

## راه‌حل موقت (بدون Development Build)

اگر نمی‌خواهی Development Build بسازی، می‌توانی موقتاً `react-native-reanimated` را غیرفعال کنی:

1. از `babel.config.js` خط `'react-native-reanimated/plugin'` را حذف کن
2. از Drawer Navigator استفاده نکن (از Stack Navigator استفاده کن)
3. انیمیشن‌ها کار نمی‌کنند

**توصیه:** بهتر است Development Build بسازی تا تمام قابلیت‌ها کار کنند.


