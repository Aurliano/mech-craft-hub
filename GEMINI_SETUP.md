# راهنمای تنظیم Google Gemini AI

## 🔐 **تنظیمات امنیتی**

### **1. دریافت API Key:**
1. به [Google AI Studio](https://makersuite.google.com/app/apikey) بروید
2. یک API Key جدید ایجاد کنید
3. API Key را کپی کنید

### **2. تنظیم Environment Variables:**

#### **برای Development:**
```bash
# در فایل .env
GEMINI_API_KEY=your-actual-gemini-api-key-here
GEMINI_MODEL_NAME=gemini-1.5-flash
```

#### **برای Production (Liara):**
```bash
# در Liara Dashboard > Environment Variables
GEMINI_API_KEY=your-actual-gemini-api-key-here
GEMINI_MODEL_NAME=gemini-1.5-flash
```

### **3. نکات امنیتی مهم:**

#### **✅ کارهای درست:**
- API Key را فقط در Environment Variables ذخیره کنید
- هرگز API Key را در کد قرار ندهید
- از `.env` فایل استفاده کنید (که در .gitignore است)
- API Key را در Production از طریق Liara Dashboard تنظیم کنید

#### **❌ کارهای نادرست:**
- API Key را در کد hardcode نکنید
- API Key را در Git commit نکنید
- API Key را در فایل‌های عمومی قرار ندهید

### **4. تست کردن:**

#### **تست محلی:**
```bash
# 1. فایل .env ایجاد کنید
cp env.example .env

# 2. API Key را در .env اضافه کنید
echo "GEMINI_API_KEY=your-actual-key" >> .env

# 3. سرور را اجرا کنید
python manage.py runserver

# 4. Support Widget را تست کنید
```

#### **تست Production:**
```bash
# 1. در Liara Dashboard Environment Variables اضافه کنید
# 2. پروژه را دیپلوی کنید
# 3. Support Widget را تست کنید
```

### **5. عیب‌یابی:**

#### **اگر API Key کار نمی‌کند:**
1. بررسی کنید API Key درست باشد
2. بررسی کنید Environment Variable تنظیم شده باشد
3. بررسی کنید Google Generative AI library نصب باشد:
   ```bash
   pip install google-generativeai
   ```

#### **لاگ‌های مفید:**
```python
# در Django logs
logger.info(f"Gemini AI enabled: {self.enabled}")
logger.error(f"Gemini API error: {str(e)}")
```

### **6. محدودیت‌ها:**
- API Key دارای محدودیت استفاده است
- برای Production، محدودیت‌های IP را تنظیم کنید
- از Rate Limiting استفاده کنید

## 🚀 **آماده برای استفاده!**

پس از تنظیم API Key، Support Widget به صورت خودکار از Gemini AI استفاده خواهد کرد.
