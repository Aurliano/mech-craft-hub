import { useState, useEffect } from "react";
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
import SubmitButton from "@/components/SubmitButton";
import { useServiceOrder } from "@/hooks/useServiceOrder";
import { useAuth } from "@/contexts/AuthContext";
import { DynamicServiceForm } from "@/components/DynamicServiceForm";
import LoginPrompt from "@/components/LoginPrompt";
import TermsAndConditions from "@/components/TermsAndConditions";
import { getAllServices } from "@/lib/api";
// import DocumentationSection from "@/components/DocumentationSection";

const Design = () => {
  // Use real authentication state
  const { isAuthenticated } = useAuth();
  
  // Resolve service id dynamically (type: design)
  const [designServiceId, setDesignServiceId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const services = await getAllServices();
        const design = Array.isArray(services)
          ? services.find((s: { type?: string; name?: string; id?: string }) => s.type === 'design')
          : undefined;
        
        if (design?.id) {
          setDesignServiceId(design.id);
        } else {
          // Fallback: use the first available service
          const firstService = Array.isArray(services) ? services[0] : undefined;
          if (firstService?.id) {
            console.warn('Design service not found, using first available service:', firstService);
            setDesignServiceId(firstService.id);
          }
        }
      } catch {
        setDesignServiceId(null);
      }
    })();
  }, []);
  
  // Use service order hook
  const {
    formData,
    needsDocumentation,
    notes,
    documentationOptions,
    documentationNotes,
    updateField,
    setNeedsDocumentation,
    setNotes,
    setDocumentationOptions,
    setDocumentationNotes,
    handleSubmit,
    isSubmitting,
    error
  } = useServiceOrder(designServiceId || ""); // Design service

  // Check if any documentation option is selected
  const hasAnyDocumentationSelected = () => {
    const options = documentationOptions || {};
    return Object.values(options).some(value => value === true);
  };

  // Create setFormData function for compatibility
  const setFormData = (updater: ((prev: Record<string, unknown>) => Record<string, unknown>) | Record<string, unknown>) => {
    if (typeof updater === 'function') {
      const newData = updater(formData);
      Object.keys(newData).forEach(key => {
        updateField(key, newData[key] as unknown as string | number | boolean | string[] | File | null | Record<string, unknown>);
      });
    } else {
      Object.keys(updater).forEach(key => {
        updateField(key, (updater as Record<string, unknown>)[key] as unknown as string | number | boolean | string[] | File | null | Record<string, unknown>);
      });
    }
  };
  
  const [file, setFile] = useState<File | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      updateField('file', e.target.files[0]);
    }
  };

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

  const ServiceIntro = () => (
    <section className="py-16 bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <Palette className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          خدمات طراحی و مدل‌سازی مهندسی
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          ما خدمات تخصصی طراحی مهندسی را با استفاده از پیشرفته‌ترین نرم‌افزارها و تکنیک‌های روز دنیا ارائه می‌دهیم. 
          تیم متخصص ما آماده طراحی و توسعه پروژه‌های شما در حوزه‌های مختلف مهندسی است.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-blue-500/10 rounded-full w-fit mx-auto mb-4">
                <Palette className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">طراحی در حوزه های مختلف</h3>
              <p className="text-sm text-muted-foreground">
                طراحی قطعات و مجموعه‌ها با استانداردهای روز دنیا
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-green-500/10 rounded-full w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">استفاده از نرم افزار های مختلف </h3>
              <p className="text-sm text-muted-foreground" dir="rtl">
                استفاده از نرم افزار های مختلف CAD برای طراحی و مدل سازی
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-purple-500/10 rounded-full w-fit mx-auto mb-4">
                <Upload className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">مستندسازی</h3>
              <p className="text-sm text-muted-foreground">
                تهیه مستندات فنی کامل برای طراحی انجام شده
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );


  const DesignForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold mb-2">فرم ثبت سفارش طراحی</h3>
        <p className="text-muted-foreground">اطلاعات پروژه خود را وارد کنید</p>
      </div>

            {designServiceId && (
              <DynamicServiceForm
                serviceId={designServiceId}
                formData={formData}
                onFieldChange={(fieldKey, value) => updateField(fieldKey, value as unknown as string | number | boolean | string[] | File | null | Record<string, unknown>)}
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
            {!designServiceId && (
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
          error={!acceptTerms && formData.description ? "لطفا قوانین و شرایط را بپذیرید" : undefined}
        />
      </div>

      {error && (
        <div className="text-center">
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {error}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      
      <ServiceIntro />

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {isAuthenticated ? <DesignForm /> : (
            <LoginPrompt 
              title="برای ثبت سفارش وارد شوید"
              description="برای دسترسی به فرم سفارش طراحی، لطفاً وارد حساب کاربری خود شوید."
              icon={<User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Design;