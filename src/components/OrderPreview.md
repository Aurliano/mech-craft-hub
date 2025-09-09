# OrderPreview Component

کامپوننت پیش‌نمایش سفارش که به کاربران امکان بررسی کامل اطلاعات سفارش قبل از تایید نهایی را می‌دهد.

## ویژگی‌ها

### ✅ قابلیت‌های پیاده‌سازی شده:
- **نمایش آمار کلی**: تعداد فیلدهای پر شده، خالی و کل
- **بررسی وضعیت فیلدها**: نمایش وضعیت هر فیلد با آیکون و رنگ مناسب
- **جزئیات فایل‌ها**: نمایش فایل‌های آپلود شده با حجم و نام
- **اعتبارسنجی**: بررسی فیلدهای اجباری و نمایش خطاها
- **اطلاعات اضافی**: نمایش مستندسازی و توضیحات
- **دکمه‌های عملیات**: ویرایش و تایید سفارش
- **رابط کاربری زیبا**: طراحی مدرن و ریسپانسیو

## استفاده

```tsx
import OrderPreview from '@/components/OrderPreview';

const MyComponent = () => {
  const handleConfirm = () => {
    // تایید سفارش
  };

  const handleEdit = () => {
    // بازگشت به فرم ویرایش
  };

  return (
    <OrderPreview
      serviceName="سرویس نقشه‌کشی"
      fields={fields}
      fieldValues={fieldValues}
      uploadedFiles={uploadedFiles}
      needsDocumentation={true}
      notes="توضیحات پروژه"
      onConfirm={handleConfirm}
      onEdit={handleEdit}
      isSubmitting={false}
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `serviceName` | `string` | - | نام سرویس |
| `fields` | `ServiceField[]` | - | آرایه فیلدهای سرویس |
| `fieldValues` | `Record<string, any>` | - | مقادیر پر شده فیلدها |
| `uploadedFiles` | `Record<string, UploadedFile[]>` | - | فایل‌های آپلود شده |
| `needsDocumentation` | `boolean` | `false` | نیاز به مستندسازی |
| `notes` | `string` | `''` | توضیحات اضافی |
| `onConfirm` | `() => void` | - | تابع تایید سفارش |
| `onEdit` | `() => void` | - | تابع ویرایش |
| `isSubmitting` | `boolean` | `false` | وضعیت ارسال |
| `className` | `string` | - | کلاس CSS اضافی |

## Interface ServiceField

```tsx
interface ServiceField {
  id: string;                    // شناسه منحصر به فرد
  name: string;                  // نام فیلد
  field_key: string;             // کلید فیلد
  type: 'text' | 'number' | 'file' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'textarea';
  options?: any[];               // گزینه‌های فیلد
  is_required: boolean;          // آیا فیلد اجباری است
  order: number;                 // ترتیب نمایش
  help_text?: string;            // متن راهنما
  validation_rules?: any;        // قوانین اعتبارسنجی
}
```

## وضعیت‌های فیلد

### آیکون‌های وضعیت:
- **✅ سبز**: فیلد پر شده
- **❌ قرمز**: فیلد اجباری خالی
- **⚠️ زرد**: فیلد اختیاری خالی

### Badge های وضعیت:
- **پر شده**: سبز
- **اجباری - خالی**: قرمز
- **اختیاری - خالی**: خاکستری

## نمایش فایل‌ها

برای فیلدهای نوع `file`:
- نمایش تعداد فایل‌های آپلود شده
- نام و حجم هر فایل
- آیکون فایل
- وضعیت آپلود

## آمار کلی

کامپوننت آمار زیر را نمایش می‌دهد:
- تعداد فیلدهای اجباری پر شده
- تعداد فیلدهای اجباری خالی
- کل تعداد فیلدها

## اعتبارسنجی

- بررسی فیلدهای اجباری
- نمایش لیست فیلدهای خالی
- غیرفعال کردن دکمه تایید در صورت وجود فیلد اجباری خالی

## مثال‌های استفاده

### مثال ساده
```tsx
<OrderPreview
  serviceName="سرویس طراحی"
  fields={fields}
  fieldValues={values}
  uploadedFiles={files}
  onConfirm={handleConfirm}
  onEdit={handleEdit}
/>
```

### مثال کامل
```tsx
<OrderPreview
  serviceName="سرویس نقشه‌کشی صنعتی"
  fields={serviceFields}
  fieldValues={formData}
  uploadedFiles={uploadedFiles}
  needsDocumentation={true}
  notes="این پروژه نیاز به دقت بالا دارد"
  onConfirm={handleConfirmOrder}
  onEdit={handleEditForm}
  isSubmitting={isLoading}
  className="my-custom-class"
/>
```

## استایل‌دهی

کامپوننت از Tailwind CSS استفاده می‌کند:

```tsx
<OrderPreview
  className="border-2 border-blue-300 rounded-lg p-4"
  // ... other props
/>
```

## مدیریت خطاها

کامپوننت خطاهای زیر را مدیریت می‌کند:

1. **فیلدهای اجباری خالی**: نمایش لیست و غیرفعال کردن تایید
2. **فایل‌های آپلود نشده**: نمایش پیام مناسب
3. **داده‌های نامعتبر**: نمایش وضعیت مناسب

## نکات مهم

- کامپوننت کاملاً ریسپانسیو است
- از RTL (راست به چپ) پشتیبانی می‌کند
- فایل‌ها فقط با وضعیت `completed` نمایش داده می‌شوند
- متن‌های طولانی در فیلدهای `textarea` کوتاه می‌شوند
- تاریخ‌ها به فرمت فارسی نمایش داده می‌شوند

## تست

برای تست کامپوننت، به صفحه `/order-preview-demo` مراجعه کنید.

## ادغام با فرم‌ها

این کامپوننت معمولاً با فرم‌های سفارش استفاده می‌شود:

1. کاربر فرم را پر می‌کند
2. روی دکمه "پیش‌نمایش سفارش" کلیک می‌کند
3. کامپوننت OrderPreview نمایش داده می‌شود
4. کاربر اطلاعات را بررسی می‌کند
5. در صورت صحیح بودن، تایید می‌کند
6. در غیر این صورت، به فرم برمی‌گردد
