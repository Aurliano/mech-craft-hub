import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DynamicFormTest } from '@/components/DynamicFormTest';
import { FileText, Palette, Wrench, BarChart3 } from 'lucide-react';

const DynamicFormTestPage = () => {
  const services = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'تحلیل و شبیه‌سازی',
      icon: BarChart3,
      description: 'تست فرم تحلیل و شبیه‌سازی مهندسی'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'طراحی',
      icon: Palette,
      description: 'تست فرم طراحی و مدل‌سازی مهندسی'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'ساخت و تولید',
      icon: Wrench,
      description: 'تست فرم ساخت و تولید'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'نقشه‌کشی',
      icon: FileText,
      description: 'تست فرم نقشه‌کشی صنعتی'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            تست سیستم فرم داینامیک
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            این صفحه برای تست عملکرد سیستم فرم داینامیک با داده‌های واقعی از بک‌اند طراحی شده است.
            می‌توانید عملکرد فرم‌های مختلف سرویس‌ها را بررسی کنید.
          </p>
        </div>

        {/* Service Tabs */}
        <Tabs defaultValue={services[0].id} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {services.map((service) => (
              <TabsTrigger key={service.id} value={service.id} className="flex items-center gap-2">
                <service.icon className="h-4 w-4" />
                {service.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {services.map((service) => (
            <TabsContent key={service.id} value={service.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5" />
                    {service.name}
                  </CardTitle>
                  <CardDescription>
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DynamicFormTest 
                    serviceId={service.id} 
                    serviceName={service.name}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>راهنمای تست</CardTitle>
            <CardDescription>
              نحوه استفاده از سیستم تست فرم داینامیک
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">مراحل تست:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>وارد حساب کاربری خود شوید</li>
                  <li>یکی از سرویس‌ها را انتخاب کنید</li>
                  <li>دکمه "اجرای تست‌ها" را کلیک کنید</li>
                  <li>نتایج تست را بررسی کنید</li>
                  <li>فرم را پر کرده و تست کنید</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-2">تست‌های انجام شده:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>بارگذاری فرم از بک‌اند</li>
                  <li>اعتبارسنجی فیلدها</li>
                  <li>آپلود فایل‌ها</li>
                  <li>ارسال فرم به بک‌اند</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default DynamicFormTestPage;
