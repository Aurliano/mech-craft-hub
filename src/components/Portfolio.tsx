import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

const Portfolio = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [loaded, setLoaded] = useState(false);

  const portfolioItems = [
    {
      id: 1,
      title: "سیستم مدیریت کارخانه",
      description: "پلتفرم جامع مدیریت تولید و کنترل کیفیت برای صنایع تولیدی",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
      category: "نرم‌افزار صنعتی"
    },
    {
      id: 2,
      title: "اپلیکیشن IoT مانیتورینگ",
      description: "سیستم نظارت و کنترل هوشمند تجهیزات صنعتی با اینترنت اشیاء",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop", 
      category: "IoT و اتوماسیون"
    },
    {
      id: 3,
      title: "پلتفرم تجزیه و تحلیل داده",
      description: "ابزار هوشمند تحلیل داده‌های صنعتی و تولید گزارش‌های تحلیلی",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
      category: "تحلیل داده"
    },
    {
      id: 4,
      title: "سیستم اتوماسیون انبار",
      description: "راه‌حل هوشمند مدیریت انبار و کنترل موجودی برای صنایع بزرگ",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=400&fit=crop",
      category: "اتوماسیون انبار"
    },
    {
      id: 5,
      title: "سیستم کنترل کیفیت",
      description: "پلتفرم پیشرفته بازرسی و کنترل کیفیت محصولات صنعتی",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
      category: "کنترل کیفیت"
    }
  ];

  // پیش‌بارگذاری تصاویر
  useEffect(() => {
    Promise.all(
      portfolioItems.map((item) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = item.image;
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    ).then(() => setLoaded(true));
  }, []);

  // اسکرول خودکار
  useEffect(() => {
    if (!api || !loaded) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [api, loaded]);

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">
            نمونه کارهای ما
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            مجموعه‌ای از پروژه‌های موفق که با تخصص و دقت برای مشتریان ما اجرا شده است
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto px-12">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {portfolioItems.map((item) => (
                <CarouselItem 
                  key={item.id} 
                  className="basis-full sm:basis-1/2 lg:basis-1/3 px-3 first:pl-0 last:pr-0"
                >
                  <div className="p-1">
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-muted/10">
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          <div className="absolute top-4 right-4">
                            <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-md">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-3">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious 
              className="absolute -right-12 top-1/2 -translate-y-1/2 bg-background hover:bg-background/80"
            />
            <CarouselNext 
              className="absolute -left-12 top-1/2 -translate-y-1/2 bg-background hover:bg-background/80"
            />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;