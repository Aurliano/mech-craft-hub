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

const Design = () => {
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
  } = useServiceOrder('550e8400-e29b-41d4-a716-446655440002');

  // Check if any documentation option is selected
  const hasAnyDocumentationSelected = () => {
    const options = formData.documentationOptions;
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
        notes={notes}
        onNotesChange={setNotes}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Documentation Options */}
      {hasAnyDocumentationSelected() && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              گزینه‌های مستندسازی
            </CardTitle>
            <CardDescription>
              نوع مستندات مورد نیاز خود را انتخاب کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="performanceReport"
                    checked={formData.documentationOptions.performanceReport}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        performanceReport: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="performanceReport" className="text-sm">
                    گزارش شرح عملکرد قطعات/سامانه
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="assemblyInstructions"
                    checked={formData.documentationOptions.assemblyInstructions}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        assemblyInstructions: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="assemblyInstructions" className="text-sm">
                    دستورالعمل مونتاژ قطعات/سامانه
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="metallurgicalDocument"
                    checked={formData.documentationOptions.metallurgicalDocument}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        metallurgicalDocument: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="metallurgicalDocument" className="text-sm">
                    سند متالوژیکی قطعات
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="heatTreatmentDocument"
                    checked={formData.documentationOptions.heatTreatmentDocument}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        heatTreatmentDocument: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="heatTreatmentDocument" className="text-sm">
                    سند عملیات حرارتی قطعات
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="analysisTestReport"
                    checked={formData.documentationOptions.analysisTestReport}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        analysisTestReport: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="analysisTestReport" className="text-sm">
                    گزارش آزمون آنالیز
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="coatingDocument"
                    checked={formData.documentationOptions.coatingDocument}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        coatingDocument: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="coatingDocument" className="text-sm">
                    سند پوشش دهی قطعات
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="bomDocument"
                    checked={formData.documentationOptions.bomDocument}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        bomDocument: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="bomDocument" className="text-sm">
                    سند BOM (لیست قطعات و مواد)
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="opcDocument"
                    checked={formData.documentationOptions.opcDocument}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        opcDocument: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="opcDocument" className="text-sm">
                    سند عملیات فرآیند ساخت(OPC)
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="fpcDocument"
                    checked={formData.documentationOptions.fpcDocument}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        fpcDocument: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="fpcDocument" className="text-sm">
                    سند فرآیند جریان ساخت (FPC)
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="qcChecklist"
                    checked={formData.documentationOptions.qcChecklist}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        qcChecklist: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="qcChecklist" className="text-sm">
                    چک لیست کنترل ابعادی (QC)
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="contractorCapabilityDocument"
                    checked={formData.documentationOptions.contractorCapabilityDocument}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        contractorCapabilityDocument: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="contractorCapabilityDocument" className="text-sm">
                    سند توانایی پیمانکار
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="designTree"
                    checked={formData.documentationOptions.designTree}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        designTree: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="designTree" className="text-sm">
                    درخت طراحی
                  </Label>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Checkbox
                    id="allPartsDocumentation"
                    checked={formData.documentationOptions.allPartsDocumentation}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      documentationOptions: { 
                        ...prev.documentationOptions, 
                        allPartsDocumentation: checked as boolean 
                      } 
                    }))}
                  />
                  <Label htmlFor="allPartsDocumentation" className="text-sm font-semibold">
                    مستندات خواسته شده را برای بخشی از قطعات میخواهم
                  </Label>
                </div>
                <p className="text-sm text-destructive mt-2">
                  اگر مستندات را برای تعدادی از قطعات منتخب نیاز دارید، در توضیحات تکمیلی مشخص کنید.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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