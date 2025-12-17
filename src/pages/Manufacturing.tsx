import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Cog, 
  Settings, 
  Zap, 
  Wrench, 
  Shield, 
  Layers,
  Target,
  Factory,
  Gauge,
  CheckCircle,
  Beaker,
  ChevronDown,
  User,
  FileText
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "react-router-dom";
import { useServiceOrder } from "@/hooks/useServiceOrder";
import { useAuth } from "@/contexts/AuthContext";
import LoginPrompt from "@/components/LoginPrompt";
import { DynamicServiceForm } from "@/components/DynamicServiceForm";
import { useContractorWorkshops } from "@/hooks/useAuth";
import TermsAndConditions from "@/components/TermsAndConditions";
import { getAllServices } from "@/lib/api";
import { CAPABILITIES_WITH_MACHINES } from "@/data/capabilitiesAndMachines";

// Icon mapping for capabilities
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CAPABILITY_ICONS: Record<string, any> = {
  'turning_milling': Cog,
  'drilling_tapping': Settings,
  'grinding': Layers,
  'cutting': Target,
  'sheet_metal': Factory,
  'gear_cutting': Settings,
  'welding': Zap,
  'edm': Zap,
  'tool_grinding': Wrench,
  'coating': Shield,
  'molding': Factory,
  'heat_treatment': Beaker,
  'wire_cut': Zap,
};

const processes = CAPABILITIES_WITH_MACHINES.map(cap => ({
  name: cap.name,
  icon: CAPABILITY_ICONS[cap.id] || Cog,
  description: cap.machines.map(m => m.name).slice(0, 3).join('، ') + (cap.machines.length > 3 ? ' و ...' : '')
}));

const Manufacturing = () => {
  const { isAuthenticated } = useAuth();
  const orderRef = useRef<HTMLDivElement>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Resolve service id dynamically (type: manufacturing)
  const [manufacturingServiceId, setManufacturingServiceId] = useState<string | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const services = await getAllServices();
        const manufacturing = Array.isArray(services)
          ? services.find((s: { type?: string; name?: string; id?: string }) => s.type === 'manufacturing')
          : undefined;
        
        if (manufacturing?.id) {
          setManufacturingServiceId(manufacturing.id);
          setServiceError(null);
        } else {
          console.error('Manufacturing service not found in available services');
          setManufacturingServiceId(null);
          setServiceError('سرویس ساخت و تولید در سیستم یافت نشد. لطفاً با پشتیبانی تماس بگیرید.');
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setManufacturingServiceId(null);
        setServiceError('خطا در بارگذاری سرویس‌ها. لطفاً صفحه را رفرش کنید.');
      }
    })();
  }, []);
  
  // Use service order hook
  const {
    formData,
    needsDocumentation,
    notes,
    documentationOptions,
    updateField,
    setNeedsDocumentation,
    setNotes,
    setDocumentationOptions,
    handleSubmit,
    isSubmitting,
    error
  } = useServiceOrder(manufacturingServiceId || ""); 

  const handleFormSubmit = async () => {
    if (!acceptTerms) {
      alert("لطفا قوانین و شرایط را بپذیرید");
      return;
    }
    
    try {
      await handleSubmit();
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 overflow-hidden" dir="rtl">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-primary bg-clip-text text-transparent">خدمات ساخت و تولید</h1>
            <p className="text-lg text-muted-foreground mb-2 leading-relaxed">
              با شبکه گسترده‌ای از کارگاه‌های مجهز و متخصص، انواع قطعات صنعتی را با بالاترین کیفیت و دقت تولید می‌کنیم.<br />
              از نمونه‌سازی تا تولید انبوه، همه نیازهای ساخت شما را پوشش می‌دهیم.
            </p>
            <p className="mt-4 md:mt-6 text-base md:text-lg font-medium text-primary mb-8 animate-pulse">
              انتخاب کنید چه فرآیندی نیاز دارید و با یک کلیک سفارش خود را شروع کنید.
            </p>
            <button
              onClick={() => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 shadow-lg transition-colors font-bold text-lg mt-2 md:mt-4"
            >
              شروع سفارش
            </button>
          </div>
        </div>
      </section>

      {/* Manufacturing Processes Section */}
      <section className="py-4 bg-muted/20" dir="rtl">
        <div className="container mx-auto px-6">
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-center gap-2 text-primary hover:text-primary/80 py-3">
              <span>نمایش فرآیندهای ساخت</span>
              <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="text-center mb-8 mt-4">
                <h2 className="text-2xl font-bold mb-2">فرآیندهای ساخت</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  مجموعه کاملی از فرآیندهای ساخت برای پاسخگویی به نیازهای متنوع صنعتی
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
                {processes.map((process) => (
                  <Card key={process.name} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="text-center">
                      <process.icon className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                      <CardTitle className="text-lg">{process.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center text-sm">
                        {process.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>

      {/* Order Section */}
      <section id="order" ref={orderRef} className="py-16 bg-muted/20" dir="rtl">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">ثبت سفارش ساخت</h2>
            <p className="text-muted-foreground">لطفاً اطلاعات زیر را تکمیل کنید.</p>
          </div>

          {isAuthenticated ? (
            <div className="max-w-3xl mx-auto space-y-6">
              
            {/* REMOVED STATIC FIELDS HERE AS REQUESTED */}

            {manufacturingServiceId && (
              <DynamicServiceForm
                serviceId={manufacturingServiceId}
                formData={formData}
                onFieldChange={updateField}
                needsDocumentation={needsDocumentation}
                onNeedsDocumentationChange={setNeedsDocumentation}
                documentationOptions={documentationOptions}
                onDocumentationOptionChange={(option, checked) => 
                  setDocumentationOptions(prev => ({ ...prev, [option]: checked }))
                }
                notes={notes}
                onNotesChange={setNotes}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
              />
            )}
            {!manufacturingServiceId && !serviceError && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">در حال بارگذاری فرم...</p>
              </div>
            )}
            {serviceError && (
              <div className="text-center py-8">
                <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  <p className="font-semibold mb-2">خطا در بارگذاری سرویس</p>
                  <p>{serviceError}</p>
                </div>
              </div>
            )}

            {/* Material Cost Notice */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg text-orange-600">⚠️ هزینه متریال</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  هزینه خرید متریال مورد سفارش با مشتری می‌باشد.
                </p>
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80">
                    <span>جزئیات بیشتر</span>
                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        با توجه به اینکه شرکت باید تعهدات فنی و مهندسی ارائه دهد؛ تأمین متریال سفارش به عهده شرکت است. 
                        بنابراین، شروع کار بعد از برآورد هزینه متریال توسط شرکت و پرداخت آن توسط مشتری می‌باشد.
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>


            {/* Terms and Conditions */}
            <div className="mt-6">
              <TermsAndConditions
                checked={acceptTerms}
                onCheckedChange={setAcceptTerms}
                error={!acceptTerms && formData.description ? "لطفا قوانین و شرایط را بپذیرید" : undefined}
              />
            </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <LoginPrompt 
              title="برای ثبت سفارش وارد شوید"
              description="برای دسترسی به فرم سفارش ساخت و تولید، لطفاً وارد حساب کاربری خود شوید."
              icon={<User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
            />
          )}
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default Manufacturing;
