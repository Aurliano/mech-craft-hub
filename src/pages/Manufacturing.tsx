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
  ChevronDown
} from "lucide-react";
// Removed unused toast Description import
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useRef, useState } from "react";

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
  const { toast } = useToast();
  const orderRef = useRef<HTMLDivElement>(null);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");

  const handleOrderClick = (id: number) => {
    setSelectedWorkshopId(String(id));
    setTimeout(() => {
      orderRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshopId || files.length === 0 || !description.trim()) {
      toast({
        title: "اطلاعات ناقص است",
        description: "لطفاً کارگاه، فایل‌ها و توضیحات را تکمیل کنید.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "سفارش ثبت شد",
      description: "درخواست شما با موفقیت ثبت شد. کارشناسان ما با شما تماس می‌گیرند.",
    });
    setSelectedWorkshopId("");
    setFiles([]);
    setDescription("");
    const fileInput = document.getElementById("order-files") as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20" dir="rtl">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <Factory className="h-14 w-14 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              خدمات ساخت و تولید
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              با شبکه گسترده ای از کارگاه های مجهز و متخصص، انواع قطعات صنعتی را با بالاترین کیفیت و دقت تولید می کنیم.
              از نمونه سازی تا تولید انبوه، همه نیازهای ساخت شما را پوشش می دهیم.
            </p>
          </div>
        </div>
      </section>

      {/* Manufacturing Processes Section */}
      <section className="py-16 bg-muted/30" dir="rtl">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">فرآیندهای ساخت</h2>
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
        </div>
      </section>

      {/* Workshops Section */}
      <section className="py-16" dir="rtl">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">کارگاه های همکار</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              شبکه ای از کارگاه های متخصص و مجهز برای ارائه بهترین خدمات ساخت
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {workshops.map((workshop) => (
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
                      {workshop.capabilities.map((capability) => (
                        <Badge key={capability} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Machines */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      دستگاه ها و دقت
                    </h4>
                    <div className="space-y-2">
                      {workshop.machines.slice(0, 2).map((machine, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{machine.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {machine.precision}
                          </Badge>
                        </div>
                      ))}
                      {workshop.machines.length > 2 && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Stats */}
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

                  <div className="mt-6">
                    <Button className="w-full" onClick={() => handleOrderClick(workshop.id)}>
                      ثبت سفارش
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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

          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">کارگاه انتخابی</label>
              <Select value={selectedWorkshopId} onValueChange={setSelectedWorkshopId}>
                <SelectTrigger>
                  <SelectValue placeholder="یک کارگاه انتخاب کنید" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background">
                  {workshops.map((w) => (
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

            <div>
              <label className="block text-sm font-medium mb-2">توضیحات تکمیلی</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="فرآیندهای لازم برای ساخت، تلرانس‌ها، متریال و ..."
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="min-w-40">ثبت سفارش</Button>
            </div>
          </form>
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
      <Footer />
    </div>
  );
};

export default Manufacturing;