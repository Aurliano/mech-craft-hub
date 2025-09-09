import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Calculator, BarChart3, Zap, Code } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SubmitButton from "@/components/SubmitButton";
import { useServiceOrder } from "@/hooks/useServiceOrder";
import { useAuth } from "@/contexts/AuthContext";
import { DynamicServiceForm } from "@/components/DynamicServiceForm";
import LoginPrompt from "@/components/LoginPrompt";
import comsolLogo from "@/assets/comsol.jpg";
import adamsLogo from "@/assets/adams.png";
import abaqusLogo from "@/assets/abaqus.png";
import matlabLogo from "@/assets/matlab.png";

const AnalysisSimulation = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("static");
  
  // Use real authentication state
  const { isAuthenticated } = useAuth();
  
  // Use service order hook
  const {
    formData,
    needsDocumentation,
    notes,
    updateField,
    setNeedsDocumentation,
    setNotes,
    handleSubmit,
    isSubmitting,
    error
  } = useServiceOrder('550e8400-e29b-41d4-a716-446655440001');

  // Lazy loading states for software logos
  const [comsolLoaded, setComsolLoaded] = useState(false);
  const [adamsLoaded, setAdamsLoaded] = useState(false);
  const [abaqusLoaded, setAbaqusLoaded] = useState(false);
  const [matlabLoaded, setMatlabLoaded] = useState(false);

  // Set active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['static', 'dynamic', 'coding'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      updateField('file', e.target.files[0]);
    }
  };

  const handleFormSubmit = async (tabType: string) => {
    try {
      await handleSubmit();
    } catch (error) {
      console.error('Error submitting order:', error);
    }
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
          ما خدمات تخصصی تحلیل و شبیه‌سازی و حل مسائل مهندسی را با استفاده از پیشرفته‌ترین نرم‌افزارهای موجود ارائه می‌دهیم. 
          تیم متخصص ما آماده حل مسائل پیچیده شما در حوزه‌های مختلف مهندسی است.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-full w-fit mx-auto mb-4">
              <Calculator className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">تحلیل استاتیکی</h3>
            <p className="text-sm text-muted-foreground">
              تحلیل تنش، کرنش و تغییر شکل قطعات و سازه‌ها
            </p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-green-500/10 rounded-full w-fit mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">تحلیل دینامیکی</h3>
            <p className="text-sm text-muted-foreground">
              شبیه‌سازی و تحلیل دینامیکی و مکانیزم ها و مجموعه ها
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


      <DynamicServiceForm
        serviceId="550e8400-e29b-41d4-a716-446655440001"
        formData={formData}
        onFieldChange={updateField}
        needsDocumentation={needsDocumentation}
        onNeedsDocumentationChange={setNeedsDocumentation}
        notes={notes}
        onNotesChange={setNotes}
      />

      <div className="text-center mt-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {error}
          </div>
        )}
        <SubmitButton 
          onClick={() => handleFormSubmit(tabType)}
          isLoading={isSubmitting}
          text={`ثبت سفارش ${title}`}
          size="lg"
          className="w-full md:w-auto"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      
      <ServiceIntro />

      {/* Software Introduction */}
      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-foreground text-center">
          نرم افزارهای مورد استفاده در تحلیل و شبیه‌سازی
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-white rounded flex items-center justify-center mb-4 p-3">
              {!comsolLoaded && (
                <div className="w-32 h-32 bg-muted animate-pulse rounded"></div>
              )}
              <img
                src={comsolLogo}
                alt="COMSOL Multiphysics"
                className={`w-32 h-32 object-contain transition-opacity duration-300 ${comsolLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setComsolLoaded(true)}
              />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">COMSOL Multiphysics</h3>
            <p className="text-sm text-muted-foreground text-center">
              نرم افزار شبیه‌سازی و تحلیل عددی پیشرفته
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center mb-4 p-3">
              {!adamsLoaded && (
                <div className="w-16 h-16 bg-muted animate-pulse rounded-lg"></div>
              )}
              <img
                src={adamsLogo}
                alt="Adams View"
                className={`w-16 h-16 object-cover transition-opacity duration-300 ${adamsLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setAdamsLoaded(true)}
              />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Adams View</h3>
            <p className="text-sm text-muted-foreground text-center">
              نرم افزار شبیه‌سازی دینامیکی چندجسمی و تحلیل حرکت
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-white rounded flex items-center justify-center mb-4 p-3">
              {!abaqusLoaded && (
                <div className="w-32 h-32 bg-muted animate-pulse rounded"></div>
              )}
              <img
                src={abaqusLogo}
                alt="ABAQUS"
                className={`w-32 h-32 object-contain transition-opacity duration-300 ${abaqusLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setAbaqusLoaded(true)}
              />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">ABAQUS</h3>
            <p className="text-sm text-muted-foreground text-center">
              نرم افزار تحلیل اجزای محدود (FEM) و شبیه‌سازی پیشرفته
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-white rounded flex items-center justify-center mb-4 p-3">
              {!matlabLoaded && (
                <div className="w-32 h-32 bg-muted animate-pulse rounded"></div>
              )}
              <img
                src={matlabLogo}
                alt="MATLAB"
                className={`w-32 h-32 object-contain transition-opacity duration-300 ${matlabLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setMatlabLoaded(true)}
              />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">MATLAB</h3>
            <p className="text-sm text-muted-foreground text-center">
              نرم افزار محاسبات عددی و شبیه‌سازی مهندسی
            </p>
          </div>
        </div>
      </div>


      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="static" className="text-sm md:text-base">
                تحلیل استاتیکی
              </TabsTrigger>
              <TabsTrigger value="dynamic" className="text-sm md:text-base">
                تحلیل دینامیکی
              </TabsTrigger>
              <TabsTrigger value="coding" className="text-sm md:text-base">
                حل مسئله با کدنویسی
              </TabsTrigger>
            </TabsList>

            <TabsContent value="static" className="mt-8">
              {isAuthenticated ? (
                <AnalysisForm
                  title="تحلیل استاتیکی"
                  description="تحلیل رفتار استاتیکی سازه‌ها و قطعات تحت بارهای ثابت"
                  showSoftwareSelect={true}
                  tabType="static"
                />
              ) : (
                <LoginPrompt 
                  title="برای ثبت سفارش وارد شوید"
                  description="برای دسترسی به فرم سفارش تحلیل و شبیه‌سازی، لطفاً وارد حساب کاربری خود شوید."
                  icon={<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
                />
              )}
            </TabsContent>

            <TabsContent value="dynamic" className="mt-8">
              {isAuthenticated ? (
                <AnalysisForm
                  title="تحلیل دینامیکی"
                  description="شبیه‌سازی رفتار دینامیکی و ارتعاشی سیستم‌ها"
                  tabType="dynamic"
                />
              ) : (
                <LoginPrompt 
                  title="برای ثبت سفارش وارد شوید"
                  description="برای دسترسی به فرم سفارش تحلیل و شبیه‌سازی، لطفاً وارد حساب کاربری خود شوید."
                  icon={<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
                />
              )}
            </TabsContent>

            <TabsContent value="coding" className="mt-8">
              {isAuthenticated ? (
                <AnalysisForm
                  title="حل مسئله با کدنویسی"
                  description="توسعه الگوریتم‌ها و حل عددی برای مسائل پیچیده"
                  tabType="coding"
                />
              ) : (
                <LoginPrompt 
                  title="برای ثبت سفارش وارد شوید"
                  description="برای دسترسی به فرم سفارش تحلیل و شبیه‌سازی، لطفاً وارد حساب کاربری خود شوید."
                  icon={<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
                />
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