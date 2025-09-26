import LazyImage from "@/components/ui/lazy-image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Portfolio = () => {
  const portfolioItems = [
    {
      id: 1,
      title: "سیستم مدیریت کارخانه",
      description: "پلتفرم جامع مدیریت تولید و کنترل کیفیت برای صنایع تولیدی",
      image: "/src/assets/hero-engineering.jpg",
      category: "نرم‌افزار صنعتی"
    },
    {
      id: 2,
      title: "اپلیکیشن IoT مانیتورینگ",
      description: "سیستم نظارت و کنترل هوشمند تجهیزات صنعتی با اینترنت اشیاء",
      image: "/src/assets/hero-engineering.jpg", 
      category: "IoT و اتوماسیون"
    },
    {
      id: 3,
      title: "پلتفرم تجزیه و تحلیل داده",
      description: "ابزار هوشمند تحلیل داده‌های صنعتی و تولید گزارش‌های تحلیلی",
      image: "/src/assets/hero-engineering.jpg",
      category: "تحلیل داده"
    },
    {
      id: 4,
      title: "سیستم اتوماسیون انبار",
      description: "راه‌حل هوشمند مدیریت انبار و کنترل موجودی برای صنایع بزرگ",
      image: "/src/assets/hero-engineering.jpg",
      category: "اتوماسیون انبار"
    },
    {
      id: 5,
      title: "سیستم کنترل کیفیت",
      description: "پلتفرم پیشرفته بازرسی و کنترل کیفیت محصولات صنعتی",
      image: "/src/assets/hero-engineering.jpg",
      category: "کنترل کیفیت"
    }
  ];

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

        <div className="max-w-6xl mx-auto">
          <Carousel className="w-full">
            <CarouselContent className="-ml-1">
              {portfolioItems.map((item) => (
                <CarouselItem key={item.id} className="pl-1 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                      <CardContent className="p-0">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <LazyImage
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          <div className="absolute top-4 right-4">
                            <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-md">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h5 className="text-xl font-bold mb-3 text-foreground">
                            {item.title}
                          </h5>
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
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;