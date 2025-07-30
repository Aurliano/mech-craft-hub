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

        <div className="relative max-w-5xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {portfolioItems.map((item) => (
                <CarouselItem key={item.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute top-4 right-4">
                          <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-foreground mb-3">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12" />
            <CarouselNext className="hidden md:flex -right-12" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;