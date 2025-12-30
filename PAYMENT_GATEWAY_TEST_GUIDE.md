# راهنمای تست درگاه پرداخت BitPay

این راهنما به شما کمک می‌کند تا درگاه پرداخت BitPay را در پروژه خود تست کنید.

## 📋 فهرست مطالب

1. [پیش‌نیازها](#پیشنیازها)
2. [تنظیمات اولیه](#تنظیمات-اولیه)
3. [روش‌های تست](#روشهای-تست)
4. [تست با Postman/Insomnia](#تست-با-postmaninsomnia)
5. [تست وب‌هوک](#تست-وبهوک)
6. [تست از طریق Frontend](#تست-از-طریق-frontend)
7. [نکات مهم](#نکات-مهم)

---

## 🔧 پیش‌نیازها

### 1. تنظیمات محیطی (Environment Variables)

ابتدا باید متغیرهای محیطی زیر را در فایل `.env` یا تنظیمات Liara تنظیم کنید:

```bash
# BitPay Configuration
BITPAY_API_KEY=your-bitpay-api-key
BITPAY_BASE_URL=https://api.bitpay.ir  # یا https://api.bitpay.ir برای تست
BITPAY_CALLBACK_URL=https://yourdomain.com/api/v1/payments/bitpay/webhook/
BITPAY_WEBHOOK_SECRET=your-webhook-secret-key  # اختیاری برای امنیت بیشتر
```

### 2. دریافت API Key از BitPay

1. وارد پنل BitPay شوید
2. به بخش **API Keys** بروید
3. یک API Key جدید ایجاد کنید
4. API Key را در متغیر `BITPAY_API_KEY` قرار دهید

### 3. تنظیم Callback URL

در پنل BitPay، URL زیر را به عنوان Callback URL تنظیم کنید:
```
https://yourdomain.com/api/v1/payments/bitpay/webhook/
```

---

## 🧪 روش‌های تست

### روش 1: تست با cURL

#### 1.1. دریافت خلاصه پرداخت‌های یک سفارش

```bash
curl -X GET "https://yourdomain.com/api/v1/orders/{order_id}/payments/summary/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**پاسخ نمونه:**
```json
{
  "material": {
    "total": 1000000,
    "paid": 0,
    "remaining": 1000000
  },
  "project": {
    "total": 5000000,
    "advance_50": 2500000,
    "final_50": 2500000,
    "paid_advance": 0,
    "paid_final": 0
  },
  "suggested_next_payment": {
    "type": "material",
    "amount": 1000000
  }
}
```

#### 1.2. شروع پرداخت متریال

```bash
curl -X POST "https://yourdomain.com/api/v1/orders/{order_id}/payments/material/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "پرداخت هزینه متریال"
  }'
```

**پاسخ موفق:**
```json
{
  "payment_id": "uuid-of-payment",
  "gateway": "bitpay",
  "redirect_url": "https://bitpay.ir/payment/xxxxx"
}
```

#### 1.3. شروع پیش‌پرداخت پروژه (50%)

```bash
curl -X POST "https://yourdomain.com/api/v1/orders/{order_id}/payments/advance/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "پیش‌پرداخت پروژه"
  }'
```

#### 1.4. شروع تسویه نهایی (50%)

```bash
curl -X POST "https://yourdomain.com/api/v1/orders/{order_id}/payments/final/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "تسویه نهایی پروژه"
  }'
```

#### 1.5. پرداخت عمومی (برای انواع دیگر)

```bash
curl -X POST "https://yourdomain.com/api/v1/payments/initiate/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order": "order-uuid",
    "amount": 100000,
    "payment_type": "material",
    "description": "توضیحات پرداخت"
  }'
```

---

## 📮 تست با Postman/Insomnia

### Collection برای Postman

می‌توانید یک Collection در Postman ایجاد کنید با این تنظیمات:

#### 1. Environment Variables

در Postman، یک Environment ایجاد کنید با متغیرهای زیر:

```
base_url: https://yourdomain.com
token: YOUR_JWT_TOKEN
order_id: YOUR_ORDER_UUID
```

#### 2. Request: Get Payment Summary

```
Method: GET
URL: {{base_url}}/api/v1/orders/{{order_id}}/payments/summary/
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
```

#### 3. Request: Initiate Material Payment

```
Method: POST
URL: {{base_url}}/api/v1/orders/{{order_id}}/payments/material/
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body (JSON):
{
  "description": "پرداخت هزینه متریال"
}
```

#### 4. Request: Initiate Advance Payment

```
Method: POST
URL: {{base_url}}/api/v1/orders/{{order_id}}/payments/advance/
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body (JSON):
{
  "description": "پیش‌پرداخت پروژه"
}
```

---

## 🔔 تست وب‌هوک

وب‌هوک BitPay زمانی فراخوانی می‌شود که پرداخت در درگاه انجام شود. برای تست وب‌هوک:

### روش 1: استفاده از ngrok (برای تست محلی)

```bash
# نصب ngrok
# دانلود از https://ngrok.com/

# اجرای ngrok
ngrok http 8000

# URL تولید شده را در BITPAY_CALLBACK_URL قرار دهید
# مثال: https://abc123.ngrok.io/api/v1/payments/bitpay/webhook/
```

### روش 2: تست دستی وب‌هوک

می‌توانید وب‌هوک را به صورت دستی با cURL تست کنید:

```bash
curl -X POST "https://yourdomain.com/api/v1/payments/bitpay/webhook/" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "your-order-uuid",
    "trans_id": "test-transaction-id",
    "amount": 1000000,
    "status": "success",
    "nonce": "test-nonce"
  }'
```

**نکته:** در حالت واقعی، BitPay این درخواست را ارسال می‌کند. برای تست، باید یک تراکنش واقعی انجام دهید.

### روش 3: استفاده از BitPay Sandbox (اگر موجود باشد)

اگر BitPay محیط تست (Sandbox) دارد:
1. از API Key تست استفاده کنید
2. `BITPAY_BASE_URL` را به URL تست تغییر دهید
3. پرداخت تست انجام دهید

---

## 🖥️ تست از طریق Frontend

### 1. ایجاد یک صفحه تست

می‌توانید یک صفحه تست در React ایجاد کنید:

```typescript
// src/pages/TestPayment.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const TestPayment = () => {
  const { token } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  const initiatePayment = async (type: 'material' | 'advance' | 'final') => {
    setLoading(true);
    try {
      const endpoint = type === 'material' 
        ? `/api/v1/orders/${orderId}/payments/material/`
        : type === 'advance'
        ? `/api/v1/orders/${orderId}/payments/advance/`
        : `/api/v1/orders/${orderId}/payments/final/`;

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: `پرداخت ${type === 'material' ? 'متریال' : type === 'advance' ? 'پیش‌پرداخت' : 'تسویه نهایی'}`
        })
      });

      const data = await response.json();
      if (data.redirect_url) {
        setPaymentUrl(data.redirect_url);
        // هدایت به درگاه پرداخت
        window.location.href = data.redirect_url;
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">تست درگاه پرداخت</h1>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="border p-2 rounded"
        />
        
        <div className="flex gap-4">
          <Button 
            onClick={() => initiatePayment('material')}
            disabled={loading || !orderId}
          >
            پرداخت متریال
          </Button>
          
          <Button 
            onClick={() => initiatePayment('advance')}
            disabled={loading || !orderId}
          >
            پیش‌پرداخت
          </Button>
          
          <Button 
            onClick={() => initiatePayment('final')}
            disabled={loading || !orderId}
          >
            تسویه نهایی
          </Button>
        </div>

        {paymentUrl && (
          <div className="mt-4 p-4 bg-green-100 rounded">
            <p>لینک پرداخت: <a href={paymentUrl} target="_blank">{paymentUrl}</a></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPayment;
```

---

## 📝 اسکریپت تست Python

می‌توانید یک اسکریپت Python برای تست خودکار ایجاد کنید:

```python
# backend/test_payment_gateway.py
import os
import sys
import django
import requests

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Order, Payment
from django.contrib.auth import get_user_model

User = get_user_model()

def test_payment_flow():
    """Test complete payment flow"""
    
    print("🧪 Testing Payment Gateway...")
    print("=" * 50)
    
    # 1. Get a test order
    try:
        test_user = User.objects.filter(is_staff=False).first()
        if not test_user:
            print("❌ No test user found. Please create a user first.")
            return
        
        order = Order.objects.filter(customer=test_user).first()
        if not order:
            print("❌ No order found for test user.")
            return
        
        print(f"✅ Found order: {order.order_number}")
        print(f"   Order ID: {order.id}")
        
        # 2. Check payment summary
        print("\n📊 Checking payment summary...")
        # You can call the API endpoint here or use the function directly
        from api.views import compute_order_payment_summary
        summary = compute_order_payment_summary(order)
        print(f"   Material: {summary['material']}")
        print(f"   Project: {summary['project']}")
        
        # 3. Check BitPay configuration
        print("\n⚙️ Checking BitPay configuration...")
        from django.conf import settings
        if settings.BITPAY_API_KEY:
            print("✅ BITPAY_API_KEY is configured")
        else:
            print("❌ BITPAY_API_KEY is not configured")
            return
        
        if settings.BITPAY_CALLBACK_URL:
            print(f"✅ BITPAY_CALLBACK_URL: {settings.BITPAY_CALLBACK_URL}")
        else:
            print("❌ BITPAY_CALLBACK_URL is not configured")
            return
        
        print("\n✅ Payment gateway configuration is correct!")
        print("\n💡 To test actual payment:")
        print("   1. Use Postman or Frontend to initiate payment")
        print("   2. Complete payment in BitPay gateway")
        print("   3. Check webhook callback")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_payment_flow()
```

**اجرای اسکریپت:**
```bash
cd backend
python test_payment_gateway.py
```

---

## ⚠️ نکات مهم

### 1. امنیت

- ✅ همیشه از HTTPS استفاده کنید
- ✅ API Key را در محیط production محافظت کنید
- ✅ از Webhook Secret برای تایید درخواست‌های وب‌هوک استفاده کنید
- ✅ بررسی کنید که فقط مالک سفارش بتواند پرداخت را شروع کند

### 2. تست در محیط Production

- ⚠️ **هرگز** با مبالغ واقعی در محیط تست کار نکنید
- ⚠️ از API Key تست استفاده کنید (اگر BitPay ارائه می‌دهد)
- ⚠️ قبل از استفاده در Production، تمام سناریوها را تست کنید

### 3. مدیریت خطا

سیستم به صورت خودکار خطاها را مدیریت می‌کند:
- خطا در اتصال به BitPay
- خطا در تایید پرداخت
- خطا در وب‌هوک

### 4. لاگ‌ها

برای بررسی لاگ‌های پرداخت:
```bash
# در Liara
liara logs --app mech-craft-hub-main

# یا در Django admin
# به بخش Payments بروید و وضعیت پرداخت‌ها را بررسی کنید
```

### 5. بررسی وضعیت پرداخت

می‌توانید وضعیت پرداخت را از طریق API بررسی کنید:

```bash
# دریافت لیست پرداخت‌های یک سفارش
GET /api/v1/orders/{order_id}/
# در پاسخ، فیلد payments شامل لیست پرداخت‌ها است
```

---

## 🔍 عیب‌یابی

### مشکل: "خطا در اتصال به درگاه پرداخت"

**راه‌حل:**
1. بررسی کنید که `BITPAY_API_KEY` صحیح است
2. بررسی کنید که `BITPAY_BASE_URL` صحیح است
3. بررسی کنید که سرور به اینترنت دسترسی دارد

### مشکل: "پرداخت معلق یافت نشد"

**راه‌حل:**
1. بررسی کنید که پرداخت قبل از وب‌هوک ایجاد شده باشد
2. بررسی کنید که `order_id` در وب‌هوک با سفارش مطابقت دارد

### مشکل: وب‌هوک فراخوانی نمی‌شود

**راه‌حل:**
1. بررسی کنید که `BITPAY_CALLBACK_URL` در پنل BitPay تنظیم شده است
2. بررسی کنید که URL قابل دسترسی است (از ngrok برای تست محلی استفاده کنید)
3. بررسی لاگ‌های سرور برای خطاها

---

## 📚 منابع بیشتر

- [مستندات BitPay](https://bitpay.ir/docs)
- [API Documentation](./API_README.md)
- [Payment Models](./backend/api/models.py)

---

## ✅ چک‌لیست تست

قبل از استفاده در Production، این موارد را تست کنید:

- [ ] دریافت خلاصه پرداخت‌ها
- [ ] شروع پرداخت متریال
- [ ] شروع پیش‌پرداخت پروژه
- [ ] شروع تسویه نهایی
- [ ] تکمیل پرداخت در درگاه BitPay
- [ ] دریافت وب‌هوک از BitPay
- [ ] تایید پرداخت و به‌روزرسانی وضعیت سفارش
- [ ] مدیریت خطاها
- [ ] بررسی لاگ‌ها

---

**نکته:** این راهنما برای کمک به تست درگاه پرداخت است. برای اطلاعات بیشتر، به مستندات BitPay مراجعه کنید.

