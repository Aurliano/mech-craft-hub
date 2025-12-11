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
import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SubmitButton from "@/components/SubmitButton";
import { useServiceOrder } from "@/hooks/useServiceOrder";
import { useAuth } from "@/contexts/AuthContext";
import LoginPrompt from "@/components/LoginPrompt";
import { DynamicServiceForm } from "@/components/DynamicServiceForm";
import { useContractorWorkshops } from "@/hooks/useAuth";
import TermsAndConditions from "@/components/TermsAndConditions";
import { getPublicWorkshops, getAllServices } from "@/lib/api";
import MultiFileUpload from "@/components/MultiFileUpload";
import { CAPABILITIES_WITH_MACHINES } from "@/data/capabilitiesAndMachines";
// import DocumentationSection from "@/components/DocumentationSection";

// Workshop type definition
type Workshop = {
  id: string | number;
  code?: string;
  name: string;
  description?: string;
  capabilities?: string[];
  machines?: { name: string; precision?: string }[];
  rating?: number;
  completedProjects?: number;
  workshop_class?: 'A' | 'B' | 'C';
  workers_count?: number;
  province?: string;
  city?: string;
};

// Mock data for workshops
const workshops: Workshop[] = [
  {
    id: 1,
    code: 'WS001001',
    name: "کارگاه A - دقت بالا",
    description: "متخصص در ساخت قطعات با دقت میکرومتری",
    capabilities: ["تراشکاری", "فرزکاری", "سنگ زنی", "نمونه سازی"],
    machines: [
      { name: "دستگاه تراش CNC", precision: "±0.005 mm" },
      { name: "فرز سه محوره", precision: "±0.01 mm" },
      { name: "سنگ زنی دقیق", precision: "±0.002 mm" }
    ],
    rating: 4.8,
    completedProjects: 150,
    workshop_class: 'A',
    workers_count: 25,
    province: 'تهران',
    city: 'تهران'
  },
  {
    id: 2,
    code: 'WS002001',
    name: "کارگاه B - جوشکاری تخصصی",
    description: "متخصص در انواع جوشکاری و پوشش دهی",
    capabilities: ["جوشکاری", "پوشش دهی", "تراشکاری", "فرزکاری"],
    machines: [
      { name: "دستگاه جوش TIG", precision: "±0.1 mm" },
      { name: "دستگاه پوشش دهی", precision: "±0.05 mm" },
      { name: "تراش کنونسیونال", precision: "±0.02 mm" }
    ],
    rating: 4.6,
    completedProjects: 120,
    workshop_class: 'B',
    workers_count: 15,
    province: 'اصفهان',
    city: 'اصفهان'
  },
  {
    id: 3,
    code: 'WS003001',
    name: "کارگاه C - تولید انبوه",
    description: "تخصص در تولید قطعات با حجم بالا",
    capabilities: ["تراشکاری", "فرزکاری", "جوشکاری", "نمونه سازی"],
    machines: [
      { name: "خط تولید اتوماتیک", precision: "±0.02 mm" },
      { name: "دستگاه تراش چندکاره", precision: "±0.015 mm" },
      { name: "فرز CNC پنج محوره", precision: "±0.008 mm" }
    ],
    rating: 4.7,
    completedProjects: 200,
    workshop_class: 'C',
    workers_count: 8,
    province: 'فارس',
    city: 'شیراز'
  }
];

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
  const [selectedWorkshopClass, setSelectedWorkshopClass] = useState<'A' | 'B' | 'C' | ''>('');
  const [files, setFiles] = useState<File[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [publicWorkshops, setPublicWorkshops] = useState<Workshop[]>([]);
  const [isLoadingPublicWorkshops, setIsLoadingPublicWorkshops] = useState(false);
  
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
          // Service type not found - fail gracefully
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
  
  // Load public workshops on mount and when filter changes
  React.useEffect(() => {
    const loadPublicWorkshops = async () => {
      setIsLoadingPublicWorkshops(true);
      try {
        const workshopClass = selectedWorkshopClass === '' ? undefined : selectedWorkshopClass as 'A' | 'B' | 'C';
        const workshops = await getPublicWorkshops(workshopClass);
        setPublicWorkshops(Array.isArray(workshops) ? (workshops as Workshop[]) : []);
      } catch (error) {
        console.error('Error loading public workshops:', error);
        setPublicWorkshops([]);
      } finally {
        setIsLoadingPublicWorkshops(false);
      }
    };
    loadPublicWorkshops();
  }, [selectedWorkshopClass]);
  
  // Get workshops from API (for contractors)
  const { data: apiWorkshops, isLoading: isLoadingWorkshops } = useContractorWorkshops();
  
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
  } = useServiceOrder(manufacturingServiceId || ""); // Manufacturing service

  // Check if any documentation option is selected
  const hasAnyDocumentationSelected = () => {
    const options = documentationOptions;
    return Object.values(options).some(value => value === true);
  };

  // Use public workshops from API (real data from approved workshops)
  const displayWorkshops = publicWorkshops;

  const handleOrderClick = (id: number | string) => {
    // No longer selecting a specific workshop for submission; keep scroll only
    setTimeout(() => {
      orderRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };


  const handleFormSubmit = async () => {
    if (!acceptTerms) {
      alert("لطفا قوانین و شرایط را بپذیرید");
      return;
    }
    
    try {
      // Add workshop class selection to form data (required)
      updateField('workshop_class', selectedWorkshopClass || '');
      
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
            <h2 className="text-3xl font-bold mb-4">شبکه کارگاه‌ها</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              کارگاه‌های تایید شده و متخصص برای ارائه بهترین خدمات ساخت
            </p>
          </div>

          {/* Workshop Class Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 border-yellow-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50 pb-4">
                <div className="flex items-center justify-center mb-2">
                  <Badge className="bg-yellow-500 text-white text-lg px-4 py-1">کلاس A</Badge>
                </div>
                <CardTitle className="text-xl text-center text-yellow-800 font-bold">کارگاه‌های کلاس A</CardTitle>
                <CardDescription className="text-center text-yellow-700 mt-2">
                  کارگاه‌های با بالاترین استانداردها و کیفیت
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">دستگاه‌های متنوع و دقیق</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">پرسنل با تجربه و متخصص</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">کیفیت تضمینی و استاندارد</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">توانایی تولید انبوه</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">گواهی‌های کیفیت و مجوز تایید شده</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 pb-4">
                <div className="flex items-center justify-center mb-2">
                  <Badge className="bg-blue-500 text-white text-lg px-4 py-1">کلاس B</Badge>
                </div>
                <CardTitle className="text-xl text-center text-blue-800 font-bold">کارگاه‌های کلاس B</CardTitle>
                <CardDescription className="text-center text-blue-700 mt-2">
                  کارگاه‌های با استانداردهای خوب و قابل اعتماد
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">دستگاه‌های تخصصی و مناسب</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">پرسنل آموزش دیده و ماهر</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">کیفیت مناسب برای پروژه‌های متوسط</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">توانایی تولید در حجم متوسط</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">مجوزها و استانداردهای لازم</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 pb-4">
                <div className="flex items-center justify-center mb-2">
                  <Badge className="bg-gray-500 text-white text-lg px-4 py-1">کلاس C</Badge>
                </div>
                <CardTitle className="text-xl text-center text-gray-800 font-bold">کارگاه‌های کلاس C</CardTitle>
                <CardDescription className="text-center text-gray-700 mt-2">
                  کارگاه‌های در حال توسعه و تکمیل امکانات
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">دستگاه‌های پایه برای تولید</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">پرسنل محدود اما فعال</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">مناسب برای پروژه‌های کوچک و نمونه‌سازی</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">قابلیت تولید در حجم پایین تا متوسط</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">در حال تکمیل مدارک و استانداردها</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workshops List */}
          {isLoadingPublicWorkshops ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">در حال بارگذاری کارگاه‌ها...</p>
            </div>
          ) : publicWorkshops.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">لیست کارگاه‌ها</h3>
                <div className="flex gap-2">
                  <Button
                    variant={selectedWorkshopClass === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedWorkshopClass('')}
                  >
                    همه
                  </Button>
                  <Button
                    variant={selectedWorkshopClass === 'A' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedWorkshopClass('A')}
                  >
                    کلاس A
                  </Button>
                  <Button
                    variant={selectedWorkshopClass === 'B' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedWorkshopClass('B')}
                  >
                    کلاس B
                  </Button>
                  <Button
                    variant={selectedWorkshopClass === 'C' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedWorkshopClass('C')}
                  >
                    کلاس C
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {publicWorkshops.map((workshop) => {
                    const workshopWithClass = workshop as { workshop_class?: string; workers_count?: number };
                    const getClassBadgeColor = (cls?: string) => {
                      if (cls === 'A') return 'bg-yellow-500';
                      if (cls === 'B') return 'bg-blue-500';
                      if (cls === 'C') return 'bg-gray-500';
                      return 'bg-gray-400';
                    };

                    return (
                      <Card key={workshop.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">{workshop.name}</CardTitle>
                              <CardDescription className="text-sm">
                                {workshop.description || 'کارگاه تخصصی ساخت و تولید'}
                              </CardDescription>
                              {(workshop as Workshop).code && (
                                <p className="text-xs text-muted-foreground mt-1">کد: {(workshop as Workshop).code}</p>
                              )}
                              {workshopWithClass.workshop_class && (
                                <Badge className={`${getClassBadgeColor(workshopWithClass.workshop_class)} text-white mt-2`}>
                                  کلاس {workshopWithClass.workshop_class}
                                </Badge>
                              )}
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
                              {(workshop.capabilities || []).slice(0, 3).map((capabilityId, index) => {
                                const capabilityObj = CAPABILITIES_WITH_MACHINES.find(c => c.id === capabilityId);
                                const displayName = capabilityObj ? capabilityObj.name : capabilityId; // If not found, show id (fallback)
                                return (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {displayName}
                                  </Badge>
                                );
                              })}
                              {(workshop.capabilities || []).length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(workshop.capabilities || []).length - 3} بیشتر
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Separator className="my-4" />

                          {/* Machines */}
                          <div className="mb-6">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Gauge className="h-4 w-4" />
                              دستگاه ها
                            </h4>
                            <div className="space-y-2">
                              {Array.isArray(workshop.machines) && workshop.machines.length > 0 ? (
                                <>
                                  {workshop.machines.slice(0, 2).map((machine: { name?: string; precision?: string }, index: number) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                      <span className="text-muted-foreground">{machine.name || `دستگاه ${index + 1}`}</span>
                                      {machine.precision && (
                                        <Badge variant="outline" className="text-xs">
                                          {machine.precision}
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                  {workshop.machines.length > 2 && (
                                    <Collapsible>
                                      <CollapsibleContent className="space-y-2 mt-2">
                                        {workshop.machines.slice(2).map((machine: { name?: string; precision?: string }, index: number) => (
                                          <div key={index} className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">{machine.name || `دستگاه ${index + 3}`}</span>
                                            {machine.precision && (
                                              <Badge variant="outline" className="text-xs">
                                                {machine.precision}
                                              </Badge>
                                            )}
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

                          {/* Additional Info */}
                          <div className="space-y-2 text-sm mb-4">
                            {workshopWithClass.workers_count && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">پرسنل:</span>
                                <span className="font-medium">{workshopWithClass.workers_count} نفر</span>
                              </div>
                            )}
                            {(workshop as Workshop).province && (workshop as Workshop).city && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">موقعیت:</span>
                                <span className="font-medium">{(workshop as Workshop).province} - {(workshop as Workshop).city}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-6">
                            <Button className="w-full" onClick={() => handleOrderClick(workshop.id)}>
                              ثبت سفارش
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">کارگاهی یافت نشد</h3>
                <p className="text-gray-600">
                  در حال حاضر کارگاه تایید شده‌ای برای نمایش وجود ندارد.
                </p>
              </CardContent>
            </Card>
          )}
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
              <label className="block text-sm font-medium mb-2">کلاس کارگاه هدف</label>
              <Select 
                value={selectedWorkshopClass || 'all'} 
                onValueChange={(value) => setSelectedWorkshopClass(value === 'all' ? '' : (value as 'A' | 'B' | 'C'))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="یک کلاس انتخاب کنید (A, B, C یا همه)" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background">
                  <SelectItem value="all">همه کارگاه‌ها</SelectItem>
                  <SelectItem value="A">کلاس A</SelectItem>
                  <SelectItem value="B">کلاس B</SelectItem>
                  <SelectItem value="C">کلاس C</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                می‌توانید یک کلاس را انتخاب کنید تا سفارش برای همان دسته کارگاه‌ها ارسال شود.
              </p>
            </div>

            <div>
              <MultiFileUpload
                fieldKey="order_files"
                label="آپلود فایل‌های مربوطه"
                isRequired={false}
                helpText="فایل‌های نقشه، مستندات و تصاویر محصول"
                maxFiles={10}
                maxSizePerFile={200}
                acceptedTypes={['.pdf', '.dwg', '.dxf', '.step', '.stp', '.iges', '.sldprt', '.sldasm', '.ipt', '.iam', '.jpg', '.jpeg', '.png']}
                onFilesChange={(uploadedFiles) => {
                  // Convert to File objects for compatibility
                  const fileObjects = uploadedFiles.map(f => f.file).filter(Boolean);
                  setFiles(fileObjects);
                  updateField('order_files', fileObjects);
                }}
                uploadedFiles={[]}
                contextId="manufacturing-order"
              />
            </div>

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