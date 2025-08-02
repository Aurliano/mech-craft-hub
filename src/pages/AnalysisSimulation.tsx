import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Calculator, BarChart3, Zap, Code } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const AnalysisSimulation = () => {
  // Mock authentication state - this should come from your auth context/state management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    description: "",
    software: "",
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = (tabType: string) => {
    // Check required fields
    if (!formData.description.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً توضیحات تفصیلی را وارد کنید.",
        variant: "destructive",
      });
      return;
    }

    // Check software selection for static analysis
    if (tabType === "static" && !formData.software) {
      toast({
        title: "خطا", 
        description: "لطفاً نرم‌افزار مورد نظر را انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }

    // Generate random order number
    const orderNumber = Math.floor(Math.random() * 10000) + 1000;
    
    // Show success message
    toast({
      title: "ثبت سفارش موفق",
      description: `سفارش شما با شماره ${orderNumber} ثبت گردید و در انتظار تایید مهندسین می‌باشد. برای پیگیری وضعیت سفارش به صفحه سفارشات مراجعه نمایید.`,
    });

    // Reset form
    setFormData({
      description: "",
      software: "",
      file: null,
    });
  };

  const ServiceIntro = () => (
    <section className="py-16 bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <BarChart3 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          خدمات تحلیل و شبیه‌سازی مهندسی
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          ما خدمات تخصصی تحلیل و شبیه‌سازی مهندسی را با استفاده از پیشرفته‌ترین نرم‌افزارهای موجود ارائه می‌دهیم. 
          تیم متخصص ما آماده حل مسائل پیچیده شما در حوزه‌های مختلف مهندسی است.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-full w-fit mx-auto mb-4">
              <Calculator className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">تحلیل استاتیک</h3>
            <p className="text-sm text-muted-foreground">
              تحلیل تنش، کرنش و تغییر شکل سازه‌ها
            </p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-green-500/10 rounded-full w-fit mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">تحلیل داینامیک</h3>
            <p className="text-sm text-muted-foreground">
              شبیه‌سازی رفتار دینامیکی و ارتعاشی
            </p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-purple-500/10 rounded-full w-fit mx-auto mb-4">
              <Code className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-2">حل مسئله با کدنویسی</h3>
            <p className="text-sm text-muted-foreground">
              توسعه الگوریتم‌های تخصصی برای مسائل پیچیده
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const LoginPrompt = () => (
    <div className="text-center py-12">
      <div className="p-6 bg-muted/30 rounded-lg max-w-md mx-auto">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">برای ثبت سفارش وارد شوید</h3>
        <p className="text-muted-foreground mb-6">
          برای دسترسی به فرم سفارش تحلیل و شبیه‌سازی، لطفاً وارد حساب کاربری خود شوید.
        </p>
        <Link to="/login">
          <Button className="w-full">
            ورود به حساب کاربری
          </Button>
        </Link>
      </div>
    </div>
  );

  const AnalysisForm = ({ 
    title, 
    description, 
    showSoftwareSelect = false, 
    tabType 
  }: { 
    title: string; 
    description: string; 
    showSoftwareSelect?: boolean; 
    tabType: string;
  }) => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              شرح پروژه
            </CardTitle>
            <CardDescription>
              لطفاً جزئیات پروژه خود را بنویسید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">توضیحات تفصیلی</Label>
                <Textarea
                  id="description"
                  placeholder="لطفاً شرح کاملی از پروژه و نیازهای خود ارائه دهید..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-32"
                />
              </div>
              
              {showSoftwareSelect && (
                <div>
                  <Label htmlFor="software">نرم‌افزار مورد نظر</Label>
                  <Select value={formData.software} onValueChange={(value) => setFormData(prev => ({ ...prev, software: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب نرم‌افزار" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adams">ADAMS</SelectItem>
                      <SelectItem value="abaqus">ABAQUS</SelectItem>
                      <SelectItem value="comsol">COMSOL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
              فایل‌های مربوط به پروژه را آپلود کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">فایل پروژه</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.dwg,.step,.iges,.zip,.rar"
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  فرمت‌های مجاز: PDF, DOC, DOCX, DWG, STEP, IGES, ZIP, RAR
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
          onClick={() => handleSubmit(tabType)}
          size="lg"
          className="w-full md:w-auto"
        >
          ثبت سفارش {title}
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
          <Tabs defaultValue="static" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="static" className="text-sm md:text-base">
                تحلیل استاتیک
              </TabsTrigger>
              <TabsTrigger value="dynamic" className="text-sm md:text-base">
                تحلیل داینامیک
              </TabsTrigger>
              <TabsTrigger value="coding" className="text-sm md:text-base">
                حل مسئله با کدنویسی
              </TabsTrigger>
            </TabsList>

            <TabsContent value="static" className="mt-8">
              {isAuthenticated ? (
                <AnalysisForm
                  title="تحلیل استاتیک"
                  description="تحلیل رفتار استاتیکی سازه‌ها و قطعات تحت بارهای ثابت"
                  showSoftwareSelect={true}
                  tabType="static"
                />
              ) : (
                <LoginPrompt />
              )}
            </TabsContent>

            <TabsContent value="dynamic" className="mt-8">
              {isAuthenticated ? (
                <AnalysisForm
                  title="تحلیل داینامیک"
                  description="شبیه‌سازی رفتار دینامیکی، ارتعاشی و گذرای سیستم‌ها"
                  tabType="dynamic"
                />
              ) : (
                <LoginPrompt />
              )}
            </TabsContent>

            <TabsContent value="coding" className="mt-8">
              {isAuthenticated ? (
                <AnalysisForm
                  title="حل مسئله با کدنویسی"
                  description="توسعه الگوریتم‌ها و نرم‌افزارهای تخصصی برای حل مسائل پیچیده"
                  tabType="coding"
                />
              ) : (
                <LoginPrompt />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AnalysisSimulation;