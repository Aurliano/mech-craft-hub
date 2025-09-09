import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MultiFileUpload from '@/components/MultiFileUpload';
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

const FileUploadDemo = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleSubmit = () => {
    const completedFiles = uploadedFiles.filter(file => file.status === 'completed');
    console.log('Submitted files:', completedFiles);
    alert(`تعداد فایل‌های آپلود شده: ${completedFiles.length}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
              نمایش کامپوننت آپلود چند فایل
            </h1>
            <p className="text-lg text-muted-foreground">
              این صفحه برای نمایش قابلیت‌های کامپوننت MultiFileUpload طراحی شده است
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>آپلود فایل‌ها</CardTitle>
              <CardDescription>
                می‌توانید حداکثر 10 فایل با حجم حداکثر 200 مگابایت آپلود کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultiFileUpload
                fieldKey="demo_files"
                label="فایل‌های پروژه"
                isRequired={true}
                helpText="فایل‌های مربوط به پروژه خود را آپلود کنید"
                maxFiles={10}
                maxSizePerFile={200}
                acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.stp', '.step', '.igs', '.iges', '.dwg', '.dxf', '.stl']}
                onFilesChange={handleFilesChange}
                uploadedFiles={uploadedFiles}
              />
              
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSubmit} className="w-full sm:w-auto">
                  ثبت فایل‌ها
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>قابلیت‌های کامپوننت</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">✅ قابلیت‌های پیاده‌سازی شده:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• آپلود چند فایل (حداکثر 10 فایل)</li>
                    <li>• نمایش پروسه آپلود با نوار پیشرفت</li>
                    <li>• قابلیت حذف فایل‌های آپلود شده</li>
                    <li>• قابلیت اضافه کردن فایل‌های بیشتر</li>
                    <li>• محدودیت حجم فایل (200 MB)</li>
                    <li>• پشتیبانی از Drag & Drop</li>
                    <li>• اعتبارسنجی نوع فایل</li>
                    <li>• نمایش وضعیت فایل‌ها</li>
                    <li>• مدیریت خطاها</li>
                    <li>• رابط کاربری زیبا و ریسپانسیو</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">🔧 تنظیمات قابل تغییر:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• حداکثر تعداد فایل (maxFiles)</li>
                    <li>• حداکثر حجم فایل (maxSizePerFile)</li>
                    <li>• انواع فایل مجاز (acceptedTypes)</li>
                    <li>• متن راهنما (helpText)</li>
                    <li>• اجباری بودن فیلد (isRequired)</li>
                    <li>• غیرفعال کردن کامپوننت (disabled)</li>
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

export default FileUploadDemo;
