import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Wrench, Package, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import solidworksLogo from "@/assets/solidworks.png";
import inventorLogo from "@/assets/inventor.png";
import autocadLogo from "@/assets/autocad.png";
import { useMe } from "@/hooks/useAuth";
import { getServices, uploadFile, createOrder } from "@/lib/api";
import SubmitButton from "@/components/SubmitButton";
import { useServiceOrder } from "@/hooks/useServiceOrder";
import { useAuth } from "@/contexts/AuthContext";
import { DynamicServiceForm } from "@/components/DynamicServiceForm";
import LoginPrompt from "@/components/LoginPrompt";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DrawingService = () => {
  // Use real authentication state
  const { isAuthenticated } = useAuth();
  
  // Use service order hook
  const {
    formData,
    needsDocumentation,
    notes,
    documentationOptions,
    updateField,
    updateDocumentationOption,
    setNeedsDocumentation,
    setNotes,
    setDocumentationOptions,
    handleSubmit,
    isSubmitting,
    error: serviceOrderError
  } = useServiceOrder('550e8400-e29b-41d4-a716-446655440004');
  
  // State for dynamic form
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('');

  // Lazy loading states for software logos
  const [solidworksLoaded, setSolidworksLoaded] = useState(false);
  const [inventorLoaded, setInventorLoaded] = useState(false);
  const [autocadLoaded, setAutocadLoaded] = useState(false);

  const { data: me } = useMe();
  const { toast } = useToast();

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getServices();
  
        let services: any[] = [];
        if (response) {
          services = Array.isArray(response) ? response : (response as any).results || [];
        }
  
        if (Array.isArray(services)) {
          const drawing = services.find((s: any) => s.type === 'drawing') || services.find((s: any) => /draw|نقشه/i.test(s.name));
          if (drawing) {
            setService(drawing);
            if (drawing.tabs && drawing.tabs.length > 0) {
              setActiveTab(drawing.tabs[0].name);
            } else {
              // اگر تب‌ها وجود ندارند، از نام سرویس استفاده کن
              setActiveTab('default');
            }
          } else {
            // Mock data برای تست
            const mockService = {
              id: '550e8400-e29b-41d4-a716-446655440004',
              name: 'نقشه‌کشی صنعتی',
              type: 'drawing',
              tabs: [
                {
                  id: '1',
                  name: 'technical_drawing',
                  display_name: 'نقشه ساخت',
                  description: 'نقشه‌های ساخت (قطعات)',
                  order: 1,
                  is_active: true,
                  fields: []
                },
                {
                  id: '2',
                  name: 'assembly_drawing',
                  display_name: 'نقشه انفجاری',
                  description: 'نقشه‌های مونتاژ و انفجاری',
                  order: 2,
                  is_active: true,
                  fields: []
                },
                {
                  id: '3',
                  name: 'welding_drawing',
                  display_name: 'نقشه جوشکاری',
                  description: 'نقشه‌های جوشکاری',
                  order: 3,
                  is_active: true,
                  fields: []
                }
              ],
              fields: []
            };
            setService(mockService);
            setActiveTab('technical_drawing');
          }
        } else {
          setError('فرمت پاسخ API نامعتبر است');
        }
      } catch (e) {
        console.error('خطا در دریافت سرویس:', e);
        setError(e instanceof Error ? e.message : 'خطا در دریافت سرویس');
      } finally {
        setLoading(false);
      }
    };
  
    fetchService();
  }, []);

  // handleFieldChange removed - using updateField from useServiceOrder hook

  const handleFileUpload = async (fieldKey: string, file: File) => {
    try {
      const uploaded = await uploadFile(file, { context: 'service', context_id: service.id });
      setUploadedFiles(prev => ({ ...prev, [fieldKey]: uploaded.url }));
      setFiles(prev => [...prev, file]);
      toast({ title: "فایل آپلود شد", description: `فایل ${file.name} با موفقیت آپلود شد.` });
    } catch (error) {
      toast({ title: "خطا در آپلود", description: "آپلود فایل با مشکل مواجه شد.", variant: "destructive" });
    }
  };

  const handleFormSubmit = async () => {
    if (!isAuthenticated) {
      alert("برای ثبت سفارش ابتدا وارد شوید.");
      return;
    }
    if (!service) {
      alert("لطفاً سرویس نقشه‌کشی را در پنل ادمین ایجاد کنید.");
      return;
    }

    const fieldsForCurrentTab = service.fields?.filter((field: any) => field.tab?.name === activeTab);
    const requiredFields = fieldsForCurrentTab?.filter((field: any) => field.is_required) || [];
    const missingFields = requiredFields.filter((field: any) => {
      if (field.type === 'file') {
        return !uploadedFiles[field.field_key];
      }
      return !formData[field.field_key];
    });

    if (missingFields.length > 0) {
      alert(`لطفاً فیلدهای زیر را پر کنید: ${missingFields.map((f: any) => f.name).join(', ')}`);
      return;
    }

    try {
      await handleSubmit();
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };


  const renderField = (field: any) => {
    // ... (renderField logic)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">در حال بارگذاری...</h1>
              <p className="text-gray-600 mb-4">
                در حال دریافت اطلاعات سرویس نقشه‌کشی
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="text-red-600 text-4xl mb-4">⚠️</div>
                <h1 className="text-xl font-bold text-red-900 mb-2">خطا در بارگذاری</h1>
                <p className="text-red-700 mb-4">{error}</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    تلاش مجدد
                  </button>
                  <button 
                    onClick={() => window.history.back()}
                    className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                  >
                    بازگشت
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="text-yellow-600 text-4xl mb-4">ℹ️</div>
                <h1 className="text-xl font-bold text-yellow-900 mb-2">سرویس یافت نشد</h1>
                <p className="text-yellow-700 mb-4">
                  سرویس نقشه‌کشی در سیستم یافت نشد. لطفاً با پشتیبانی تماس بگیرید.
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                >
                  تلاش مجدد
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20" dir="rtl">
      <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 overflow-hidden" dir="rtl">
        <div className="absolute inset-0 pointer-events-none opacity-10 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]">
          <div className="absolute -top-10 left-1/4 w-64 h-64 bg-primary/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 right-1/4 w-64 h-64 bg-secondary/40 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-primary bg-clip-text text-transparent">خدمات نقشه‌کشی صنعتی</h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              نقشه‌های ساخت، مونتاژ، جوشکاری و مستندسازی حرفه‌ای با استفاده از نرم‌افزارهای روز دنیا.
            </p>
            <div className="flex items-center justify-center gap-6 opacity-90">
              <img src={solidworksLogo} alt="SolidWorks" className="h-10 md:h-12 object-contain" />
              <img src={inventorLogo} alt="Inventor" className="h-10 md:h-12 object-contain" />
              <img src={autocadLogo} alt="AutoCAD" className="h-10 md:h-12 object-contain" />
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 py-8">
        {/* Service Introduction */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            نقشه کشی
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            ما خدمات تخصصی نقشه کشی صنعتی را ارائه می‌دهیم. از نقشه‌های جوش گرفته تا نقشه‌های انفجاری و ساخت قطعات، 
            تمامی نیازهای شما را با بالاترین کیفیت و دقت برآورده می‌کنیم.
          </p>
          {/* Software Introduction */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              نرم افزارهای مورد استفاده
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-center p-4 bg-muted/40 rounded-lg">
                <img src={solidworksLogo} alt="SolidWorks" className="h-12 object-contain" loading="lazy" />
              </div>
              <div className="flex items-center justify-center p-4 bg-muted/40 rounded-lg">
                <img src={inventorLogo} alt="Inventor" className="h-12 object-contain" loading="lazy" />
              </div>
              <div className="flex items-center justify-center p-4 bg-muted/40 rounded-lg">
                <img src={autocadLogo} alt="AutoCAD" className="h-12 object-contain" loading="lazy" />
              </div>
            </div>
          </div>
        </div>


        {/* Dynamic Form Section */}
        {/* Show intro and tabs to everyone; lock only submission for guests */}
        {service && (
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">انتخاب نوع نقشه کشی</CardTitle>
              <CardDescription className="text-center">
                نوع سرویس مورد نیاز خود را انتخاب کرده و فایل‌های لازم را آپلود کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              {service.tabs && service.tabs.length > 0 ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue={service.tabs[0]?.name} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    {service.tabs.map((tab: any) => (
                      <TabsTrigger key={tab.id} value={tab.name}>
                        {tab.display_name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {service.tabs.map((tab: any) => (
                    <TabsContent key={tab.id} value={tab.name} className="space-y-6">
                      <DynamicServiceForm
                        serviceId="550e8400-e29b-41d4-a716-446655440004"
                        formData={formData}
                        onFieldChange={updateField}
                        needsDocumentation={needsDocumentation}
                        onNeedsDocumentationChange={setNeedsDocumentation}
                        notes={notes}
                        onNotesChange={setNotes}
                        documentationOptions={documentationOptions}
                        onDocumentationOptionChange={updateDocumentationOption}
                        onSubmit={isAuthenticated ? handleFormSubmit : undefined}
                        isSubmitting={!isAuthenticated || isSubmitting}
                      />
                      {!isAuthenticated && (
                        <div className="text-center text-sm text-muted-foreground">
                          برای ثبت نهایی سفارش، لطفاً ابتدا وارد شوید.
                          <div className="mt-2">
                            <Button asChild size="sm" variant="outline">
                              <Link to="/login">ورود</Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    در حال حاضر هیچ تب فعالی برای این سرویس تعریف نشده است.
                  </p>
                  <DynamicServiceForm
                    serviceId="550e8400-e29b-41d4-a716-446655440004"
                    formData={formData}
                    onFieldChange={updateField}
                    needsDocumentation={needsDocumentation}
                    onNeedsDocumentationChange={setNeedsDocumentation}
                    notes={notes}
                    onNotesChange={setNotes}
                    documentationOptions={documentationOptions}
                    onDocumentationOptionChange={updateDocumentationOption}
                    onSubmit={isAuthenticated ? handleFormSubmit : undefined}
                    isSubmitting={!isAuthenticated || isSubmitting}
                  />
                  {!isAuthenticated && (
                    <div className="text-center text-sm text-muted-foreground mt-4">
                      برای ثبت نهایی سفارش، لطفاً ابتدا وارد شوید.
                      <div className="mt-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/login">ورود</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DrawingService;