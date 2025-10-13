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
// Removed unused toast Description import
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SubmitButton from "@/components/SubmitButton";
import { useServiceOrder } from "@/hooks/useServiceOrder";
import { useAuth } from "@/contexts/AuthContext";
import LoginPrompt from "@/components/LoginPrompt";
import { DynamicServiceForm } from "@/components/DynamicServiceForm";
import { useContractorWorkshops } from "@/hooks/useAuth";
import TermsAndConditions from "@/components/TermsAndConditions";
import DocumentationSection from "@/components/DocumentationSection";

// Mock data for workshops
const workshops = [
  {
    id: 1,
    name: "کارگاه A - دقت بالا",
    description: "متخصص در ساخت قطعات با دقت میکرومتری",
    capabilities: ["تراشکاری", "فرزکاری", "سنگ زنی", "نمونه سازی"],
    machines: [
      { name: "دستگاه تراش CNC", precision: "±0.005 mm" },
      { name: "فرز سه محوره", precision: "±0.01 mm" },
      { name: "سنگ زنی دقیق", precision: "±0.002 mm" }
    ],
    rating: 4.8,
    completedProjects: 150
  },
  {
    id: 2,
    name: "کارگاه B - جوشکاری تخصصی",
    description: "متخصص در انواع جوشکاری و پوشش دهی",
    capabilities: ["جوشکاری", "پوشش دهی", "تراشکاری", "فرزکاری"],
    machines: [
      { name: "دستگاه جوش TIG", precision: "±0.1 mm" },
      { name: "دستگاه پوشش دهی", precision: "±0.05 mm" },
      { name: "تراش کنونسیونال", precision: "±0.02 mm" }
    ],
    rating: 4.6,
    completedProjects: 120
  },
  {
    id: 3,
    name: "کارگاه C - تولید انبوه",
    description: "تخصص در تولید قطعات با حجم بالا",
    capabilities: ["تراشکاری", "فرزکاری", "جوشکاری", "نمونه سازی"],
    machines: [
      { name: "خط تولید اتوماتیک", precision: "±0.02 mm" },
      { name: "دستگاه تراش چندکاره", precision: "±0.015 mm" },
      { name: "فرز CNC پنج محوره", precision: "±0.008 mm" }
    ],
    rating: 4.7,
    completedProjects: 200
  }
];

const processes = [
  { name: "تراشکاری", icon: Cog, description: "تراشکاری CNC ، Manual ، فرزکاری" },
  { name: "فرزکاری", icon: Settings, description: "فرزکاری CNC سه محور ، چهار محور ، پنج محور " },
  { name: "جوشکاری", icon: Zap, description: "جوشکاری TIG , MIG , SMAW " },
  { name: "پوشش دهی", icon: Shield, description: "اجرای فرآیند های پوشش دهی با ضخامت و متریال درخواستی" },
  { name: "سنگ زنی", icon: Layers, description: "اصلاح اعوجاج یا تغییر شکل‌های جزئی بعد از ماشین‌کاری" },
  { name: "نمونه سازی", icon: Target, description: "ساخت نمونه اولیه محصولات با پرینتر سه بعدی" },
  { name: "فرآیند های متالوژی", icon:Beaker, description: "آنالیز جنس مواد، اندازه گیری سختی، عملیات حرارتی و ..."}
];

const Manufacturing = () => {
  const { isAuthenticated } = useAuth();
  const orderRef = useRef<HTMLDivElement>(null);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Get workshops from API
  const { data: apiWorkshops, isLoading: isLoadingWorkshops } = useContractorWorkshops();
  
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
  } = useServiceOrder('550e8400-e29b-41d4-a716-446655440003');

  // Check if any documentation option is selected
  const hasAnyDocumentationSelected = () => {
    const options = documentationOptions;
    return Object.values(options).some(value => value === true);
  };

  // Use API workshops if available, otherwise fallback to mock data
  const displayWorkshops = apiWorkshops && apiWorkshops.length > 0 ? apiWorkshops : workshops;

  const handleOrderClick = (id: number | string) => {
    setSelectedWorkshopId(String(id));
    setTimeout(() => {
      orderRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };


  const handleFormSubmit = async () => {
    if (!selectedWorkshopId) {
      alert("لطفاً کارگاه مورد نظر را انتخاب کنید.");
      return;
    }

    if (!acceptTerms) {
      alert("لطفا قوانین و شرایط را بپذیرید");
      return;
    }
    
    try {
      // Add workshop selection to form data
      updateField('selected_workshop_id', selectedWorkshopId);
      
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
        {/* Decorative Process Icons as background */}
        <div className="pointer-events-none absolute inset-0 flex flex-wrap items-center justify-center opacity-20 select-none z-0">
          {processes.map((process, i) => {
            const Icon = process.icon;
            return (
              <div
                key={process.name}
                className="m-4 flex flex-col items-center"
                style={{
                  transform: `scale(${0.95 + (Math.sin(i * 2) * 0.15)}) rotate(${(i % 2 ? 7 : -7) * i}deg)`
                }}
              >
                <Icon className="h-20 w-20 md:h-28 md:w-28 text-primary/60 drop-shadow-xl transition-all duration-500" />
                <div className="mt-2 text-xs md:text-sm text-primary/60 font-bold text-center whitespace-nowrap">
                  {process.name}
                </div>
              </div>
            );
          })}
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-primary bg-clip-text text-transparent">خدمات ساخت و تولید</h1>
            <p className="text-lg text-muted-foreground mb-2 leading-relaxed">
              با شبکه گسترده‌ای از کارگاه‌های مجهز و متخصص، انواع قطعات صنعتی را با بالاترین کیفیت و دقت تولید می‌کنیم.<br />
              از نمونه‌سازی تا تولید انبوه، همه نیازهای ساخت شما را پوشش می‌دهیم.
            </p>
            {/* Guide sentence */}
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">آماده شروع پروژه خود هستید؟</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            تیم متخصص ما آماده مشاوره و راهنمایی شما برای انتخاب بهترین کارگاه و فرآیند ساخت است.
          </p>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            درخواست مشاوره رایگان
          </button>
        </div>
      </section>      
      
      {/* Workshops Section */}
      <section className="py-16" dir="rtl">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">کارگاه های طرف قرارداد شرکت </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              شبکه ای از کارگاه های متخصص و مجهز برای ارائه بهترین خدمات ساخت
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {isLoadingWorkshops ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">در حال بارگذاری کارگاه‌ها...</p>
              </div>
            ) : (
              displayWorkshops.map((workshop) => (
              <Card key={workshop.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{workshop.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {workshop.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/20 px-2 py-1 rounded-full">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{workshop.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Capabilities */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      توانمندی ها
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(workshop.capabilities || []).map((capability) => (
                        <Badge key={capability} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Machines */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">                      <Gauge className="h-4 w-4" />
                      دستگاه ها و دقت
                    </h4>
                    <div className="space-y-2">
                      {Array.isArray(workshop.machines) && workshop.machines.length > 0 ? (
                        <>
                          {workshop.machines.slice(0, 2).map((machine, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">{machine.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {machine.precision}
                              </Badge>
                            </div>
                          ))}
                          {workshop.machines.length > 2 && (
                            <Collapsible>
                              <CollapsibleContent className="space-y-2 mt-2">
                                {workshop.machines.slice(2).map((machine, index) => (
                                  <div key={index} className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">{machine.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {machine.precision}
                                    </Badge>
                                  </div>
                                ))}
                              </CollapsibleContent>
                              <CollapsibleTrigger className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
                                <span className="data-[state=open]:hidden">نمایش بیشتر</span>
                                <span className="hidden data-[state=open]:inline">نمایش کمتر</span>
                                <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                              </CollapsibleTrigger>
                            </Collapsible>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground text-sm">اطلاعات دستگاه موجود نیست</p>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Stats - Only show for mock data */}
                  {workshop.completedProjects && workshop.rating && (
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-primary">{workshop.completedProjects}</div>
                        <div className="text-muted-foreground">پروژه تکمیل شده</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-primary">{workshop.rating}/5</div>
                        <div className="text-muted-foreground">امتیاز کیفیت</div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <Button className="w-full" onClick={() => handleOrderClick(workshop.id)}>
                      ثبت سفارش
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
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
            <div>
              <label className="block text-sm font-medium mb-2">کارگاه انتخابی</label>
              <Select value={selectedWorkshopId} onValueChange={setSelectedWorkshopId}>
                <SelectTrigger>
                  <SelectValue placeholder="یک کارگاه انتخاب کنید" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background">
                  {displayWorkshops.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="order-files" className="block text-sm font-medium mb-2">آپلود فایل‌های مربوطه</label>
              <Input
                id="order-files"
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
              <p className="text-xs text-muted-foreground mt-2">
                فرمت‌های مجاز: PDF, DWG, DXF, STEP, تصاویر و ...
              </p>
            </div>

            <DynamicServiceForm
              serviceId="550e8400-e29b-41d4-a716-446655440003"
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