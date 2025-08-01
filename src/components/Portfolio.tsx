import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LazyImage from "@/components/ui/lazy-image";

const Portfolio = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
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

  // حذف پیش‌بارگذاری تصاویر - حالا lazy loading استفاده می‌کنیم
  useEffect(() => {
    setLoaded(true);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % portfolioItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + portfolioItems.length) % portfolioItems.length);
  };

  // اسکرول خودکار
  useEffect(() => {
    if (!loaded) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [loaded]);

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

        <div className="testimonials max-w-6xl mx-auto">
          <div className="testimonials-slider relative overflow-hidden">
            <button 
              className="slick-prev absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-primary p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
              onClick={prevSlide}
              aria-label="Previous"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <div className="slick-list overflow-hidden mx-16">
              <div 
                className="slick-track flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * (100 / 3)}%)`,
                  width: `${(portfolioItems.length * 100) / 3}%`
                }}
              >
                {portfolioItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`slide w-1/3 px-3 ${
                      index === currentSlide ? 'slick-current slick-active' : ''
                    }`}
                  >
                    <div className="box bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="image relative aspect-[16/9] overflow-hidden">
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
                      <div className="content p-6">
                        <h5 className="text-xl font-bold mb-3 text-foreground">
                          {item.title}
                        </h5>
                        <div className="testimonial text-muted-foreground text-sm leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="slick-next absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-primary p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
              onClick={nextSlide}
              aria-label="Next"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;