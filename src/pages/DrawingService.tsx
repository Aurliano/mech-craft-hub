import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import solidworksLogo from "@/assets/solidworks.png";
import inventorLogo from "@/assets/inventor.png";
import autocadLogo from "@/assets/autocad.png";
import { useServiceOrder } from "@/hooks/useServiceOrder";
import { useAuth } from "@/contexts/AuthContext";
import ServiceTabs from "@/components/ServiceTabs";
import LoginPrompt from "@/components/LoginPrompt";
import TermsAndConditions from "@/components/TermsAndConditions";
import { User } from "lucide-react";
import { getAllServices } from "@/lib/api";

type FieldValue = string | number | boolean | string[] | File | null | Record<string, unknown>;

const DrawingService = () => {
  const { isAuthenticated } = useAuth();
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Resolve service id dynamically (type: drawing)
  const [drawingServiceId, setDrawingServiceId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const services = await getAllServices();
        const drawing = Array.isArray(services)
          ? services.find((s: { type?: string; name?: string; id?: string }) => s.type === 'drawing')
          : undefined;
        
        if (drawing?.id) {
          setDrawingServiceId(drawing.id);
        } else {
          // Fallback: use the first available service
          const firstService = Array.isArray(services) ? services[0] : undefined;
          if (firstService?.id) {
            console.warn('Drawing service not found, using first available service:', firstService);
            setDrawingServiceId(firstService.id);
          }
        }
      } catch {
        setDrawingServiceId(null);
      }
    })();
  }, []);
  
  // Use service order hook with tabFieldValues support
  const {
    formData,
    tabFieldValues,
    needsDocumentation,
    notes,
    documentationOptions,
    updateField,
    updateTabField,
    setNeedsDocumentation,
    setNotes,
    setDocumentationOptions,
    handleSubmit,
    isSubmitting,
    error
  } = useServiceOrder(drawingServiceId || ""); // Drawing service

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
            {/* Software logos */}
            <div className="flex items-center justify-center gap-6 opacity-90">
              <img src={solidworksLogo} alt="SolidWorks" className="h-10 md:h-12 object-contain" />
              <img src={inventorLogo} alt="Inventor" className="h-10 md:h-12 object-contain" />
              <img src={autocadLogo} alt="AutoCAD" className="h-10 md:h-12 object-contain" />
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        {/* Form Section */}
        {isAuthenticated ? (
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">انتخاب نوع نقشه کشی</CardTitle>
              <CardDescription className="text-center">
                نوع نقشه مورد نیاز خود را انتخاب کرده و اطلاعات لازم را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {drawingServiceId ? (
                <ServiceTabs
                  serviceId={drawingServiceId}
                  onFieldChange={(tabId, fieldKey, value) => updateTabField(tabId, fieldKey, value as FieldValue)}
                  fieldValues={tabFieldValues}
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
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">در حال بارگذاری فرم...</p>
                </div>
              )}
              
              {/* Terms and Conditions */}
              <div className="mt-6">
                <TermsAndConditions
                  checked={acceptTerms}
                  onCheckedChange={setAcceptTerms}
                  error={!acceptTerms && notes ? "لطفا قوانین و شرایط را بپذیرید" : undefined}
                />
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-6xl mx-auto">
            <CardContent className="p-12 text-center">
              <LoginPrompt 
                title="برای ثبت سفارش وارد شوید"
                description="برای دسترسی به فرم سفارش نقشه‌کشی، لطفاً وارد حساب کاربری خود شوید."
                icon={<User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
              />
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default DrawingService;
