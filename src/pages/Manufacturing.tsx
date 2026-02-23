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
  FileText,
  MapPin,
  Star,
  MessageSquare
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "react-router-dom";
import { useServiceOrder } from "@/hooks/useServiceOrder";
import { useAuth } from "@/contexts/AuthContext";
import LoginPrompt from "@/components/LoginPrompt";
import { DynamicServiceForm } from "@/components/DynamicServiceForm";
import { useContractorWorkshops } from "@/hooks/useAuth";
import TermsAndConditions from "@/components/TermsAndConditions";
import { getAllServices, getPublicWorkshops } from "@/lib/api";
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

interface PublicWorkshop {
  id: string;
  name: string;
  code?: string;
  workshop_class?: 'A' | 'B' | 'C' | null;
  description?: string;
  province?: string;
  city?: string;
  capabilities?: string[];
  machines?: { name: string; precision?: string; quantity?: number; is_custom?: boolean }[];
  rating?: number;
  owner_id?: string | null;
  owner_display_name?: string | null;
}

const CLASS_INFO = {
  'A': {
    title: 'کلاس A',
    description: 'کارگاه‌های پیشرفته با تجهیزات CNC دقیق، سیستم کنترل کیفیت و قابلیت تولید انبوه. مناسب برای پروژه‌های حساس.',
    color: 'bg-yellow-500',
    icon: Shield,
    features: ['تجهیزات پیشرفته CNC', 'کنترل کیفیت دقیق', 'تیراژ بالا', 'تضمین کیفیت']
  },
  'B': {
    title: 'کلاس B',
    description: 'کارگاه‌های نیمه صنعتی با ترکیب ماشین‌آلات دستی و CNC. مناسب برای تولیدات نیمه انبوه و قطعات با دقت متوسط.',
    color: 'bg-blue-500',
    icon: Settings,
    features: ['ترکیب دستی و CNC', 'دقت بالا', 'تیراژ متوسط', 'قیمت مناسب']
  },
  'C': {
    title: 'کلاس C',
    description: 'کارگاه‌های سنتی با ماشین‌آلات دستی. مناسب برای تعمیرات، قطعات تکی و کارهای غیر دقیق.',
    color: 'bg-gray-500',
    icon: Wrench,
    features: ['ماشین‌آلات دستی', 'تعمیرات', 'تکی سازی', 'ارزان ترین گزینه']
  }
};

const Manufacturing = () => {
  const { isAuthenticated } = useAuth();
  const orderRef = useRef<HTMLDivElement>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [workshops, setWorkshops] = useState<PublicWorkshop[]>([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<PublicWorkshop | null>(null);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const data = await getPublicWorkshops();
        // Cast unknown[] to PublicWorkshop[] if the API returns matching structure
        setWorkshops(data as unknown as PublicWorkshop[]);
      } catch (error) {
        console.error('Error fetching public workshops:', error);
      } finally {
        setLoadingWorkshops(false);
      }
    };
    fetchWorkshops();
  }, []);

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

      {/* Workshop Classes Section */}
      <section className="py-16 bg-background" dir="rtl">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">سطح‌بندی کارگاه‌ها</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              برای اطمینان از کیفیت و پاسخگویی به نیازهای مختلف، کارگاه‌ها در سه سطح دسته‌بندی شده‌اند
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(Object.keys(CLASS_INFO) as Array<keyof typeof CLASS_INFO>).map((cls) => {
              const info = CLASS_INFO[cls];
              return (
                <Card key={cls} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-t-4" style={{ borderTopColor: cls === 'A' ? '#eab308' : cls === 'B' ? '#3b82f6' : '#6b7280' }}>
                  <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                    <info.icon className="w-32 h-32" />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${info.color} text-white px-3 py-1 text-base`}>
                        {info.title}
                      </Badge>
                      <info.icon className={`h-8 w-8 ${cls === 'A' ? 'text-yellow-500' : cls === 'B' ? 'text-blue-500' : 'text-gray-500'}`} />
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {info.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {info.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Approved Workshops Section */}
      <section className="py-16 bg-muted/30" dir="rtl">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">کارگاه‌های منتخب</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              لیست کارگاه‌های تایید شده و آماده به کار
            </p>
          </div>

          {loadingWorkshops ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">در حال بارگذاری کارگاه‌ها...</p>
            </div>
          ) : workshops.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {workshops.map((workshop) => (
                <Card key={workshop.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Left Side: Info */}
                    <div className="lg:col-span-8 p-6">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <h3 className="text-2xl font-bold text-primary">{workshop.name}</h3>
                        {workshop.workshop_class && (
                          <Badge className={`${workshop.workshop_class === 'A' ? 'bg-yellow-500' :
                            workshop.workshop_class === 'B' ? 'bg-blue-500' : 'bg-gray-500'
                            } text-white`}>
                            کلاس {workshop.workshop_class}
                          </Badge>
                        )}
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {workshop.province || "ایران"}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-500 mr-auto lg:mr-0 lg:ml-auto">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < (workshop.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {workshop.description || "توضیحات کارگاه..."}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Capabilities */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-primary" />
                            توانمندی‌ها
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {workshop.capabilities?.slice(0, 6).map((capId, idx) => {
                              const cap = CAPABILITIES_WITH_MACHINES.find(c => c.id === capId);
                              return (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {cap ? cap.name : capId}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        {/* Machines */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-primary" />
                            تجهیزات شاخص
                          </h4>
                          <ul className="space-y-2">
                            {workshop.machines?.slice(0, 3).map((machine, idx) => (
                              <li key={idx} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                                <span className="font-medium">{machine.name}</span>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  {machine.quantity && <span>({machine.quantity} عدد)</span>}
                                  {machine.precision && <span>دقت: {machine.precision}</span>}
                                </div>
                              </li>
                            ))}
                            {workshop.machines && workshop.machines.length > 3 && (
                              <li className="text-xs text-center text-primary cursor-pointer hover:underline">
                                و {workshop.machines.length - 3} دستگاه دیگر...
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: CTA */}
                    <div className="lg:col-span-4 bg-gradient-to-br from-primary/5 to-secondary/5 p-6 flex flex-col justify-center items-center border-t lg:border-t-0 lg:border-r border-border">
                      <div className="text-center w-full">
                        {workshop.owner_id && workshop.owner_display_name && (
                          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <span className="block text-sm text-muted-foreground mb-2">پیمانکار</span>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <Link
                                to={`/users/${workshop.owner_id}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {workshop.owner_display_name}
                              </Link>
                              <Link to={`/messages?user=${workshop.owner_id}`}>
                                <Button variant="outline" size="sm" className="gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  پیام
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}
                        <div className="mb-6">
                          <span className="block text-sm text-muted-foreground mb-1">وضعیت</span>
                          <span className="inline-flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full">
                            <CheckCircle className="h-4 w-4" />
                            تایید شده و فعال
                          </span>
                        </div>

                        <Button
                          size="lg"
                          className="w-full text-lg shadow-lg hover:shadow-xl transition-all mb-3"
                          onClick={() => {
                            setSelectedWorkshop(workshop);
                            document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
                            setNotes(prev => (prev ? prev + '\n' : '') + `سفارش برای کارگاه: ${workshop.name} (کد: ${workshop.code || 'نامشخص'})`);
                          }}
                        >
                          ثبت سفارش از این کارگاه
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          با انتخاب این گزینه، سفارش شما مستقیماً برای بررسی به این کارگاه ارسال می‌شود.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed">
              <p className="text-muted-foreground">در حال حاضر کارگاهی برای نمایش وجود ندارد.</p>
            </div>
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

          {selectedWorkshop && (
            <div className="max-w-3xl mx-auto mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold text-primary">در حال ثبت سفارش برای: {selectedWorkshop.name}</p>
                  <p className="text-xs text-muted-foreground">درخواست شما مستقیماً برای این کارگاه ارسال خواهد شد.</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedWorkshop(null)} className="h-8 w-8 p-0">
                <span className="sr-only">حذف انتخاب</span>
                <ChevronDown className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          )}

          {isAuthenticated ? (
            <div className="max-w-3xl mx-auto space-y-6">

              {/* REMOVED STATIC FIELDS HERE AS REQUESTED */}

              {manufacturingServiceId && (
                <>
                  {/* فرآیندهای ساخت: همان لیست صفحه، قابل تیک زدن در فرم */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">فرآیندهای ساخت مورد نیاز</CardTitle>
                      <CardDescription>
                        فرآیندهایی که برای سفارش نیاز دارید را انتخاب کنید (همان فرآیندهای معرفی‌شده در این صفحه)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {CAPABILITIES_WITH_MACHINES.map((cap) => {
                          const selected = Array.isArray(formData.manufacturing_processes)
                            ? (formData.manufacturing_processes as string[]).includes(cap.id)
                            : false;
                          return (
                            <label
                              key={cap.id}
                              className="flex items-center gap-2 cursor-pointer rounded-md p-2 hover:bg-muted/50"
                            >
                              <Checkbox
                                checked={selected}
                                onCheckedChange={(checked) => {
                                  const current = Array.isArray(formData.manufacturing_processes)
                                    ? (formData.manufacturing_processes as string[])
                                    : [];
                                  const next = checked
                                    ? [...current.filter((id) => id !== cap.id), cap.id]
                                    : current.filter((id) => id !== cap.id);
                                  updateField('manufacturing_processes', next);
                                }}
                              />
                              <span className="text-sm font-medium">{cap.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
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
                    excludeFieldKeys={['manufacturing_processes']}
                  />
                </>
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
