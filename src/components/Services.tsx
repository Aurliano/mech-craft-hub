import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Compass, BarChart3, FileText, Settings } from "lucide-react";

const Services = () => {
  const servicesList = [
    {
      icon: Compass,
      title: "طراحی و مدل سازی",
      description: "طراحی قطعات و سیستم‌های مکانیکی با استفاده از نرم‌افزارهای پیشرفته CAD",
      features: ["طراحی سه بعدی", "مدل‌سازی پارامتری", "طراحی مفهومی", "بهینه‌سازی طراحی"],
      href: "/design"
    },
    {
      icon: BarChart3,
      title: "تحلیل و شبیه‌سازی",
      description: "تحلیل تنش، حرارتی و دینامیکی قطعات و سیستم‌های مکانیکی",
      features: ["تحلیل اجزای محدود", "شبیه‌سازی CFD", "تحلیل مودال", "بهینه‌سازی عملکرد"],
      href: "/analysis"
    },
    {
      icon: FileText,
      title: "نقشه‌کشی صنعتی",
      description: "تهیه نقشه‌های فنی و مهندسی مطابق با استانداردهای بین‌المللی",
      features: ["نقشه‌کشی فنی", "جزئیات ساخت", "مشخصات فنی", "استانداردسازی"],
      href: "/drawing"
    },
    {
      icon: Settings,
      title: "ساخت و تولید",
      description: "ساخت و تولید قطعات مکانیکی با بالاترین کیفیت و دقت",
      features: ["ماشین‌کاری CNC", "پرینت سه بعدی", "کنترل کیفیت", "مونتاژ و تست"],
      href: "/manufacturing"
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            خدمات ما
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ما طیف کاملی از خدمات مهندسی مکانیک را ارائه می‌دهیم تا پروژه شما از ایده تا محصول نهایی را پوشش دهیم
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesList.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-card border-border">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-foreground text-right">{service.title}</CardTitle>
                  <CardDescription className="text-muted-foreground text-right">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-right">
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-muted-foreground flex items-center justify-end">
                        <span>{feature}</span>
                        <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                    onClick={() => window.location.href = service.href}
                  >
                    اطلاعات بیشتر
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative max-w-sm mx-auto px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false,
              dragFree: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {servicesList.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <CarouselItem key={index} className="pl-2">
                    <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-card border-border">
                      <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                          <IconComponent className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-foreground text-right">{service.title}</CardTitle>
                        <CardDescription className="text-muted-foreground text-right">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-right">
                        <ul className="space-y-2 mb-6">
                          {service.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="text-sm text-muted-foreground flex items-center justify-end">
                              <span>{feature}</span>
                              <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          variant="outline" 
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                          onClick={() => window.location.href = service.href}
                        >
                          اطلاعات بیشتر
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="-left-6 bg-background/80 hover:bg-background border-border" />
            <CarouselNext className="-right-6 bg-background/80 hover:bg-background border-border" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Services;