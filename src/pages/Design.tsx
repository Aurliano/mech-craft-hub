import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Palette, User } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Design = () => {
  // Mock authentication state - this should come from your auth context/state management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    description: "",
    file: null as File | null,
    needsDocumentation: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = () => {
    // Check required fields
    if (!formData.description.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً توضیحات پروژه را وارد کنید.",
        variant: "destructive",
      });
      return;
    }

    // Generate random order number
    const orderNumber = Math.floor(Math.random() * 10000) + 1000;
    
    // Show success message
    toast({
      title: "ثبت سفارش موفق",
      description: `سفارش طراحی شما با شماره ${orderNumber} ثبت گردید و در انتظار تایید مهندسین می‌باشد. برای پیگیری وضعیت سفارش به صفحه سفارشات مراجعه نمایید.`,
    });

    // Reset form
    setFormData({
      description: "",
      file: null,
      needsDocumentation: false,
    });
  };

  const ServiceIntro = () => (
    <section className="py-16 bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <Palette className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          خدمات طراحی مهندسی
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          ما خدمات تخصصی طراحی مهندسی را با استفاده از پیشرفته‌ترین نرم‌افزارها و تکنیک‌های روز دنیا ارائه می‌دهیم. 
          تیم متخصص ما آماده طراحی و توسعه پروژه‌های شما در حوزه‌های مختلف مهندسی است.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-full w-fit mx-auto mb-4">
              <Palette className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">طراحی صنعتی</h3>
            <p className="text-sm text-muted-foreground">
              طراحی قطعات و مجموعه‌های صنعتی با استانداردهای روز دنیا
            </p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-green-500/10 rounded-full w-fit mx-auto mb-4">
              <FileText className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">نقشه‌کشی فنی</h3>
            <p className="text-sm text-muted-foreground">
              تهیه نقشه‌های فنی و تولیدی با دقت و کیفیت بالا
            </p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-purple-500/10 rounded-full w-fit mx-auto mb-4">
              <Upload className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-2">مستندسازی</h3>
            <p className="text-sm text-muted-foreground">
              تهیه مستندات فنی کامل و راهنمای کاربری
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const LoginPrompt = () => (
    <div className="text-center py-12">
      <div className="p-6 bg-muted/30 rounded-lg max-w-md mx-auto">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">برای ثبت سفارش وارد شوید</h3>
        <p className="text-muted-foreground mb-6">
          برای دسترسی به فرم سفارش طراحی، لطفاً وارد حساب کاربری خود شوید.
        </p>
        <Link to="/login">
          <Button className="w-full">
            ورود به حساب کاربری
          </Button>
        </Link>
      </div>
    </div>
  );

  const DesignForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold mb-2">فرم ثبت سفارش طراحی</h3>
        <p className="text-muted-foreground">اطلاعات پروژه خود را وارد کنید</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Description Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              شرح پروژه
            </CardTitle>
            <CardDescription>
              توضیحات کامل پروژه طراحی خود را ارائه دهید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">توضیحات پروژه *</Label>
                <Textarea
                  id="description"
                  placeholder="لطفاً شرح کاملی از پروژه طراحی، نیازمندی‌ها، ابعاد، مواد و سایر جزئیات مهم ارائه دهید..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-32"
                />
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="documentation"
                  checked={formData.needsDocumentation}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, needsDocumentation: checked as boolean }))}
                />
                <Label htmlFor="documentation" className="text-sm">
                  برای طرحم نیاز به ارائه مستندات دارم
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              بارگذاری فایل
            </CardTitle>
            <CardDescription>
              فایل‌های مرجع یا اسکچ اولیه را آپلود کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">فایل‌های پروژه (اختیاری)</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.dwg,.step,.iges,.jpg,.jpeg,.png,.zip,.rar"
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  فرمت‌های مجاز: PDF, DOC, DOCX, DWG, STEP, IGES, JPG, PNG, ZIP, RAR
                </p>
              </div>
              
              {formData.file && (
                <div className="p-3 bg-muted/30 rounded-md">
                  <p className="text-sm font-medium">فایل انتخاب شده:</p>
                  <p className="text-sm text-muted-foreground">{formData.file.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={handleSubmit}
          size="lg"
          className="w-full md:w-auto"
        >
          ثبت سفارش طراحی
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      
      <ServiceIntro />

      {/* Test Login Button */}
      <div className="text-center py-4 bg-muted/20">
        <Button 
          variant="outline" 
          onClick={() => setIsAuthenticated(!isAuthenticated)}
          className="mb-4"
        >
          {isAuthenticated ? "خروج از حساب (تست)" : "ورود به حساب (تست)"}
        </Button>
        <p className="text-sm text-muted-foreground">
          وضعیت فعلی: {isAuthenticated ? "وارد شده" : "وارد نشده"}
        </p>
      </div>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {isAuthenticated ? <DesignForm /> : <LoginPrompt />}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Design;