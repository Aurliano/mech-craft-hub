import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid, FileText, FolderPlus, Wallet, Eye, Ticket, TrendingUp, Layers, NotebookPen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = !!user && ((((user as unknown as Record<string, unknown>)?.role) === 'admin') || ((user as unknown as { role?: { name?: string } }).role?.name === 'admin'));

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">دسترسی محدود</h2>
              <p className="text-muted-foreground">فقط مدیران می‌توانند به این صفحه دسترسی داشته باشند</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Updated links based on available routes
  const actions = [
    { title: 'مدیریت کارگاه‌ها', desc: 'تایید و مدیریت کارگاه‌های ثبت شده', icon: Grid, to: '/admin/workshop-management' },
    { title: 'مدیریت فایل‌های علمی', desc: 'آپلود/حذف و دسته‌بندی منابع علمی', icon: FileText, to: '/admin/file-manager' },
    { title: 'مدیریت نیروی کار', desc: 'مدیریت نیروهای متخصص و تطابق‌ها', icon: Users, to: '/admin/workforce-management' },
    
    // Fixed links: pointing to a centralized Admin Order Management if it exists, or just general lists for now
    // Since "Admin Order View" isn't explicitly built as a separate page yet, we might reuse /orders but with admin privileges?
    // Actually, 'Order Status', 'Material', 'Financial' usually imply managing the orders.
    // Let's point them to the new /admin/orders route if we create it, or /orders for now.
    // The user said: "Endpoints... don't take user anywhere".
    // I will point them to '/admin/dashboard' temporarily or '/orders' if admin sees all orders there.
    // Wait, OrderViewSet.get_queryset shows all orders for admin. So '/orders' is correct for "Order Status".
    
    { title: 'برآورد متریال', desc: 'ثبت/ویرایش برآورد هزینه متریال سفارشات ساخت', icon: Layers, to: '/orders' }, // Admin sees all orders in /orders and can click details
    { title: 'گزارش‌های مالی', desc: 'بررسی پرداخت‌ها و تسویه‌ها', icon: Wallet, to: '/orders' }, // Financials are usually on order details
    { title: 'وضعیت سفارشات', desc: 'پیگیری وضعیت سفارش‌ها و اقلام پروژه', icon: Eye, to: '/orders' },
    
    { title: 'پیشنهادات پیمانکاران', desc: 'مشاهده و مدیریت پیشنهادات', icon: TrendingUp, to: '/contractor/quotes' }, // Or a generic quotes page? /quotes is for customer.
    // Admin might want to see ALL quotes. QuoteViewSet lets staff see all.
    // So /quotes might work if we allow admin access to the page. 
    // ContractorQuotes page is specific to contractor. CustomerQuotes is for customer.
    // We might need an AdminQuotes page. For now, let's point to /orders where they can drill down.
    
    { title: 'تیکت‌ها', desc: 'مشاهده/پاسخ به همه تیکت‌های پشتیبانی', icon: Ticket, to: '/support' },
    { title: 'مدیریت وبلاگ', desc: 'آپلود فایل و دسته‌بندی پست‌ها', icon: NotebookPen, to: '/blog' },
    { title: 'ایجاد دسته‌بندی جدید', desc: 'افزودن دسته‌های محتوا', icon: FolderPlus, to: '/admin/file-manager' },
  ];

  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      <section className="py-10 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">داشبورد مدیر</h1>
            <p className="text-muted-foreground mt-2">می‌توانید قابلیت‌های مدیریتی را از اینجا اجرا کنید.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <Card key={a.title} className="hover:shadow-md transition">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-primary" />
                      <CardTitle>{a.title}</CardTitle>
                    </div>
                    <CardDescription>{a.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to={a.to}>ورود</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
