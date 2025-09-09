# MultiFileUpload Component

کامپوننت پیشرفته آپلود چند فایل با قابلیت‌های کامل مدیریت فایل‌ها.

## ویژگی‌ها

### ✅ قابلیت‌های پیاده‌سازی شده:
- **آپلود چند فایل**: حداکثر 10 فایل همزمان
- **نمایش پروسه آپلود**: نوار پیشرفت برای هر فایل
- **مدیریت فایل‌ها**: حذف، اضافه کردن فایل‌های جدید
- **محدودیت حجم**: حداکثر 200 مگابایت برای هر فایل
- **Drag & Drop**: کشیدن و رها کردن فایل‌ها
- **اعتبارسنجی**: بررسی نوع و حجم فایل‌ها
- **نمایش وضعیت**: آپلود، تکمیل، خطا
- **مدیریت خطاها**: نمایش پیام‌های خطا
- **رابط کاربری زیبا**: طراحی مدرن و ریسپانسیو

## استفاده

```tsx
import MultiFileUpload from '@/components/MultiFileUpload';

const MyComponent = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  return (
    <MultiFileUpload
      fieldKey="project_files"
      label="فایل‌های پروژه"
      isRequired={true}
      helpText="فایل‌های مربوط به پروژه خود را آپلود کنید"
      maxFiles={10}
      maxSizePerFile={200}
      acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.png']}
      onFilesChange={handleFilesChange}
      uploadedFiles={uploadedFiles}
      disabled={false}
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fieldKey` | `string` | - | کلید منحصر به فرد فیلد |
| `label` | `string` | - | برچسب فیلد |
| `isRequired` | `boolean` | `false` | آیا فیلد اجباری است |
| `helpText` | `string` | - | متن راهنما |
| `maxFiles` | `number` | `10` | حداکثر تعداد فایل |
| `maxSizePerFile` | `number` | `200` | حداکثر حجم هر فایل (MB) |
| `acceptedTypes` | `string[]` | `[]` | انواع فایل مجاز |
| `onFilesChange` | `(files: UploadedFile[]) => void` | - | تابع تغییر فایل‌ها |
| `uploadedFiles` | `UploadedFile[]` | `[]` | فایل‌های آپلود شده |
| `disabled` | `boolean` | `false` | غیرفعال کردن کامپوننت |
| `className` | `string` | - | کلاس CSS اضافی |

## Interface UploadedFile

```tsx
interface UploadedFile {
  id: string;                    // شناسه منحصر به فرد
  file: File;                    // فایل اصلی
  url: string;                   // URL فایل آپلود شده
  originalName: string;          // نام اصلی فایل
  size: number;                  // حجم فایل (بایت)
  status: 'uploading' | 'completed' | 'error';  // وضعیت فایل
  progress: number;              // درصد پیشرفت (0-100)
  error?: string;                // پیام خطا (در صورت وجود)
}
```

## انواع فایل پشتیبانی شده

کامپوننت از انواع فایل زیر پشتیبانی می‌کند:

### اسناد
- `.pdf` - فایل‌های PDF
- `.doc`, `.docx` - فایل‌های Word
- `.txt` - فایل‌های متنی

### تصاویر
- `.jpg`, `.jpeg` - تصاویر JPEG
- `.png` - تصاویر PNG
- `.gif` - تصاویر GIF

### فایل‌های CAD
- `.stp`, `.step` - فایل‌های STEP
- `.igs`, `.iges` - فایل‌های IGES
- `.dwg` - فایل‌های AutoCAD
- `.dxf` - فایل‌های DXF
- `.stl` - فایل‌های STL

## مثال‌های استفاده

### مثال ساده
```tsx
<MultiFileUpload
  fieldKey="documents"
  label="اسناد"
  onFilesChange={setFiles}
  uploadedFiles={files}
/>
```

### مثال پیشرفته
```tsx
<MultiFileUpload
  fieldKey="project_files"
  label="فایل‌های پروژه"
  isRequired={true}
  helpText="فایل‌های CAD و تصاویر پروژه را آپلود کنید"
  maxFiles={5}
  maxSizePerFile={100}
  acceptedTypes={['.stp', '.dwg', '.pdf', '.jpg']}
  onFilesChange={handleFilesChange}
  uploadedFiles={uploadedFiles}
  disabled={isSubmitting}
  className="my-custom-class"
/>
```

## استایل‌دهی

کامپوننت از Tailwind CSS استفاده می‌کند و قابل سفارشی‌سازی است:

```tsx
<MultiFileUpload
  className="border-2 border-dashed border-blue-300 rounded-lg p-8"
  // ... other props
/>
```

## مدیریت خطاها

کامپوننت خطاهای زیر را مدیریت می‌کند:

1. **حجم فایل بیش از حد**: نمایش پیام خطا
2. **نوع فایل غیرمجاز**: نمایش پیام خطا
3. **تعداد فایل بیش از حد**: نمایش پیام خطا
4. **خطای آپلود**: نمایش پیام خطا و امکان حذف فایل

## نکات مهم

- فایل‌ها به صورت همزمان آپلود می‌شوند
- در صورت خطا، فایل قابل حذف است
- وضعیت هر فایل به صورت جداگانه نمایش داده می‌شود
- کامپوننت کاملاً ریسپانسیو است
- از RTL (راست به چپ) پشتیبانی می‌کند

## تست

برای تست کامپوننت، به صفحه `/file-upload-demo` مراجعه کنید.
