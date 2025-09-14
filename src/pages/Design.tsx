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
import SubmitButton from "@/components/SubmitButton";
import { useServiceOrder } from "@/hooks/useServiceOrder";
import { useAuth } from "@/contexts/AuthContext";
import { DynamicServiceForm } from "@/components/DynamicServiceForm";
import LoginPrompt from "@/components/LoginPrompt";
import TermsAndConditions from "@/components/TermsAndConditions";
import DocumentationSection from "@/components/DocumentationSection";

const Design = () => {
  // Use real authentication state
  const { isAuthenticated } = useAuth();
  
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
  } = useServiceOrder('550e8400-e29b-41d4-a716-446655440002');

  // Check if any documentation option is selected
  const hasAnyDocumentationSelected = () => {
    const options = documentationOptions || {};
    return Object.values(options).some(value => value === true);
  };

  // Create setFormData function for compatibility
  const setFormData = (updater: any) => {
    if (typeof updater === 'function') {
      const newData = updater(formData);
      Object.keys(newData).forEach(key => {
        updateField(key, newData[key]);
      });
    } else {
      Object.keys(updater).forEach(key => {
        updateField(key, updater[key]);
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
    // Check required fields
    if (!formData.description?.trim()) {
      alert("لطفا توضیحات پروژه را وارد کنید");
      return;
    }

    if (!file) {
      alert("لطفا فایل پروژه را آپلود کنید");
      return;
    }

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

            <DynamicServiceForm
              serviceId="550e8400-e29b-41d4-a716-446655440002"
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