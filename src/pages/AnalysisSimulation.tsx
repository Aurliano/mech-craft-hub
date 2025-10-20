import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  BarChart3, 
  Code, 
  FileText, 
  Upload, 
  Settings,
  CheckCircle,
  User,
  Zap,
  Cpu,
  Database
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useServiceOrder } from "@/hooks/useServiceOrder";
import { useAuth } from "@/contexts/AuthContext";
import { DynamicServiceForm } from "@/components/DynamicServiceForm";
import LoginPrompt from "@/components/LoginPrompt";
import TermsAndConditions from "@/components/TermsAndConditions";
import DocumentationSection from "@/components/DocumentationSection";

const AnalysisSimulation = () => {
  // Use real authentication state
  const { isAuthenticated } = useAuth();
  
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
  } = useServiceOrder('550e8400-e29b-41d4-a716-446655440004');

  const [acceptTerms, setAcceptTerms] = useState(false);

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
            <Calculator className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          خدمات تحلیل و شبیه‌سازی
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          ما خدمات تخصصی تحلیل استاتیکی، دینامیکی و حل مسائل با کدنویسی را با استفاده از پیشرفته‌ترین نرم‌افزارها ارائه می‌دهیم. 
          تیم متخصص ما آماده تحلیل و شبیه‌سازی پروژه‌های شما در حوزه‌های مختلف مهندسی است.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-blue-500/10 rounded-full w-fit mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">تحلیل استاتیکی</h3>
              <p className="text-sm text-muted-foreground">
                تحلیل استاتیکی با نرم‌افزارهای COMSOL، ABAQUS و ADAMS
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-green-500/10 rounded-full w-fit mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">تحلیل دینامیکی</h3>
              <p className="text-sm text-muted-foreground">
                تحلیل دینامیکی و شبیه‌سازی سیستم‌های پیچیده
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-purple-500/10 rounded-full w-fit mx-auto mb-4">
                <Code className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">حل مسئله با کدنویسی</h3>
              <p className="text-sm text-muted-foreground">
                حل مسائل با MATLAB و SIMULINK
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );

  const AnalysisForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold mb-2">فرم ثبت سفارش تحلیل و شبیه‌سازی</h3>
        <p className="text-muted-foreground">نوع تحلیل مورد نظر خود را انتخاب کنید</p>
      </div>

      <DynamicServiceForm
        serviceId="550e8400-e29b-41d4-a716-446655440004"
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

      {/* Documentation Section */}
      <DocumentationSection
        needsDocumentation={needsDocumentation}
        onNeedsDocumentationChange={setNeedsDocumentation}
        documentationOptions={documentationOptions}
        onDocumentationOptionChange={(option, checked) => 
          setDocumentationOptions(prev => ({ ...prev, [option]: checked }))
        }
        documentationNotes={documentationNotes}
        onDocumentationNotesChange={setDocumentationNotes}
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
          {isAuthenticated ? <AnalysisForm /> : (
            <LoginPrompt 
              title="برای ثبت سفارش وارد شوید"
              description="برای دسترسی به فرم سفارش تحلیل و شبیه‌سازی، لطفاً وارد حساب کاربری خود شوید."
              icon={<User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AnalysisSimulation;