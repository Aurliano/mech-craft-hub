import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OrderPreview from '@/components/OrderPreview';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface UploadedFile {
  id: string;
  file: File;
  url: string;
  originalName: string;
  size: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface ServiceField {
  id: string;
  name: string;
  field_key: string;
  type: 'text' | 'number' | 'file' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'textarea';
  options?: any[];
  is_required: boolean;
  order: number;
  help_text?: string;
  validation_rules?: any;
}

const OrderPreviewDemo = () => {
  const [showPreview, setShowPreview] = useState(false);

  // Sample data for demonstration
  const sampleFields: ServiceField[] = [
    {
      id: '1',
      name: 'نام پروژه',
      field_key: 'project_name',
      type: 'text',
      is_required: true,
      order: 1,
      help_text: 'نام پروژه خود را وارد کنید'
    },
    {
      id: '2',
      name: 'نوع نقشه',
      field_key: 'drawing_type',
      type: 'select',
      options: ['نقشه جوش', 'نقشه انفجاری', 'نقشه مونتاژ', 'نقشه جزئیات'],
      is_required: true,
      order: 2
    },
    {
      id: '3',
      name: 'تعداد صفحات',
      field_key: 'page_count',
      type: 'number',
      is_required: false,
      order: 3
    },
    {
      id: '4',
      name: 'فایل‌های CAD',
      field_key: 'cad_files',
      type: 'file',
      is_required: true,
      order: 4,
      help_text: 'فایل‌های CAD پروژه را آپلود کنید'
    },
    {
      id: '5',
      name: 'توضیحات فنی',
      field_key: 'technical_description',
      type: 'textarea',
      is_required: false,
      order: 5
    },
    {
      id: '6',
      name: 'نرم‌افزار مورد استفاده',
      field_key: 'software_used',
      type: 'multiselect',
      options: ['SolidWorks', 'AutoCAD', 'Inventor', 'CATIA'],
      is_required: false,
      order: 6
    },
    {
      id: '7',
      name: 'تاریخ تحویل مورد نظر',
      field_key: 'delivery_date',
      type: 'date',
      is_required: true,
      order: 7
    },
    {
      id: '8',
      name: 'نیاز به بازرسی',
      field_key: 'needs_inspection',
      type: 'checkbox',
      is_required: false,
      order: 8
    }
  ];

  const sampleFieldValues = {
    project_name: 'پروژه سیستم انتقال قدرت',
    drawing_type: 'نقشه انفجاری',
    page_count: 15,
    technical_description: 'این پروژه شامل طراحی سیستم انتقال قدرت برای ماشین‌آلات صنعتی است. نیاز به دقت بالا در طراحی و ساخت دارد.',
    software_used: ['SolidWorks', 'AutoCAD'],
    delivery_date: '2024-02-15',
    needs_inspection: true
  };

  const sampleUploadedFiles: Record<string, UploadedFile[]> = {
    cad_files: [
      {
        id: '1',
        file: new File([''], 'assembly.step'),
        url: '/uploads/assembly.step',
        originalName: 'assembly.step',
        size: 2048576,
        status: 'completed',
        progress: 100
      },
      {
        id: '2',
        file: new File([''], 'part1.step'),
        url: '/uploads/part1.step',
        originalName: 'part1.step',
        size: 1024768,
        status: 'completed',
        progress: 100
      }
    ]
  };

  const handleConfirm = () => {
    alert('سفارش با موفقیت ثبت شد!');
    setShowPreview(false);
  };

  const handleEdit = () => {
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
              نمایش کامپوننت پیش‌نمایش سفارش
            </h1>
            <p className="text-lg text-muted-foreground">
              این صفحه برای نمایش قابلیت‌های کامپوننت OrderPreview طراحی شده است
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>دمو پیش‌نمایش سفارش</CardTitle>
              <CardDescription>
                در این دمو می‌توانید نحوه نمایش اطلاعات سفارش قبل از تایید نهایی را مشاهده کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  این کامپوننت اطلاعات زیر را نمایش می‌دهد:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>آمار کلی فیلدهای پر شده و خالی</li>
                  <li>جزئیات تمام فیلدها با وضعیت آن‌ها</li>
                  <li>فایل‌های آپلود شده با جزئیات</li>
                  <li>اطلاعات اضافی مثل مستندسازی و توضیحات</li>
                  <li>اعتبارسنجی فیلدهای اجباری</li>
                </ul>
                
                <div className="flex justify-center pt-4">
                  <Button onClick={() => setShowPreview(true)}>
                    نمایش پیش‌نمایش سفارش
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {showPreview && (
            <OrderPreview
              serviceName="سرویس نقشه‌کشی صنعتی"
              fields={sampleFields}
              fieldValues={sampleFieldValues}
              uploadedFiles={sampleUploadedFiles}
              needsDocumentation={true}
              notes="این پروژه نیاز به دقت بالا و بازرسی فنی دارد. لطفاً در طراحی به استانداردهای ISO توجه کنید."
              onConfirm={handleConfirm}
              onEdit={handleEdit}
              isSubmitting={false}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>قابلیت‌های کامپوننت OrderPreview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600">✅ قابلیت‌های اصلی:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• نمایش آمار کلی فیلدها</li>
                    <li>• بررسی وضعیت هر فیلد (پر/خالی)</li>
                    <li>• نمایش جزئیات فایل‌های آپلود شده</li>
                    <li>• اعتبارسنجی فیلدهای اجباری</li>
                    <li>• نمایش اطلاعات اضافی</li>
                    <li>• دکمه‌های ویرایش و تایید</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-600">🎨 ویژگی‌های UI:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• آیکون‌های وضعیت برای هر فیلد</li>
                    <li>• رنگ‌بندی بر اساس وضعیت</li>
                    <li>• نمایش حجم فایل‌ها</li>
                    <li>• طراحی ریسپانسیو</li>
                    <li>• پشتیبانی از RTL</li>
                    <li>• رابط کاربری زیبا و مدرن</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderPreviewDemo;
