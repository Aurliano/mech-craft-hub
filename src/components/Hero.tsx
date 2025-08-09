import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Cog, Users, Award, Code2, LucideLaptop, LucideLaptopMinimalCheck, BellElectricIcon, Brain, Zap, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-engineering.jpg";

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = heroImage;
    img.onload = () => setImageLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse">
          <div className="absolute inset-0 bg-primary/80"></div>
        </div>
      )}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-primary/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right space-y-2">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight space-y-4">
            پلتفرم جامع خدمات مهندسی 
            <br />
            <h2 className="text-5xl text-accent bg-gradient-to-r from-accent to-primary-glow bg-clip-text ">
              با دقت و کیفیت بالا
            </h2>
          </h1>
          
          <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            با استفاده از جدیدترین تکنولوژی‌ها و نرم‌افزارهای مهندسی، پروژه‌های شما را با بالاترین کیفیت انجام می‌دهیم
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button variant="hero" size="lg" className="group" onClick={() => {
              const contact = document.getElementById('contact');
              contact?.scrollIntoView({ behavior: 'smooth' });
            }}>
              همکاری با ما
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-primary"
              onClick={() => {
              const servicesSection = document.getElementById('services');
              servicesSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            مشاهده خدمات
          </Button>
          </div>

          {/* Services Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" >
            {/* Mechanical Engineering Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <Cog className="h-8 w-8 text-accent ml-3" />
                <h3 className="text-xl font-bold text-primary-foreground text-center">مهندسی مکانیک</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3 mb-4">
                <a 
                  href="/design" 
                  className="bg-white/5 hover:bg-white/15 p-3 rounded-lg border border-white/10 transition-all duration-300 hover:border-accent/50 text-center group"
                >
                  <div className="text-primary-foreground font-medium group-hover:text-accent transition-colors text-sm">
                    طراحی و مدل‌سازی
                  </div>
                </a>
                
                <a 
                  href="/analysis-simulation" 
                  className="bg-white/5 hover:bg-white/15 p-3 rounded-lg border border-white/10 transition-all duration-300 hover:border-accent/50 text-center group"
                >
                  <div className="text-primary-foreground font-medium group-hover:text-accent transition-colors text-sm">
                    تحلیل و شبیه‌سازی
                  </div>
                </a>
                
                <a 
                  href="/drawing-service" 
                  className="bg-white/5 hover:bg-white/15 p-3 rounded-lg border border-white/10 transition-all duration-300 hover:border-accent/50 text-center group"
                >
                  <div className="text-primary-foreground font-medium group-hover:text-accent transition-colors text-sm">
                    نقشه‌کشی صنعتی
                  </div>
                </a>
              </div>
              <Collapsible>
                <CollapsibleContent>
                  <a 
                    href="/manufacturing" 
                    className="bg-white/5 hover:bg-white/15 p-3 rounded-lg border border-white/10 transition-all duration-300 hover:border-accent/50 text-center group"
                  >
                    <div className="text-primary-foreground font-medium group-hover:text-accent transition-colors text-sm">
                      ساخت و تولید
                    </div>
                  </a>
                </CollapsibleContent>
                <div className="text-center mt-2">
                  <CollapsibleTrigger className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80">
                    <span className="data-[state=open]:hidden">نمایش بیشتر</span>
                    <span className="hidden data-[state=open]:inline">نمایش کمتر</span>
                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </Collapsible>
              
              <div className="text-center">
                <button 
                  onClick={() => {
                    const servicesSection = document.getElementById('services');
                    servicesSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-accent hover:text-accent/80 font-medium transition-colors underline text-sm"
                >
                  مشاهده خدمات مهندسی مکانیک
                </button>
              </div>
            </div>

            {/* Computer Engineering Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-accent ml-3" />
                <h3 className="text-xl font-bold text-primary-foreground text-center">مهندسی کامپیوتر</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3 mb-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center opacity-60">
                  <div className="text-primary-foreground font-medium text-sm">
                    طراحی وب
                  </div>
                </div>
                
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center opacity-60">
                  <div className="text-primary-foreground font-medium text-sm">
                    هوش مصنوعی و علم داده
                  </div>
                </div>
                
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center opacity-60">
                  <div className="text-primary-foreground font-medium text-sm">
                    برنامه نویسی
                  </div>
                </div>
              </div>
              <Collapsible>
                <CollapsibleContent>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center opacity-60">
                    <div className="text-primary-foreground font-medium text-sm">
                      طراحی اپلیکیشن موبایل
                    </div>
                  </div>
                </CollapsibleContent>
                <div className="text-center mt-2">
                  <CollapsibleTrigger className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80">
                    <span className="data-[state=open]:hidden">نمایش بیشتر</span>
                    <span className="hidden data-[state=open]:inline">نمایش کمتر</span>
                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </Collapsible>
              
              <div className="text-center">
                <button 
                  disabled
                  className="text-primary-foreground/50 font-medium cursor-not-allowed text-sm"
                >
                  مشاهده‌خدمات‌مهندسی‌کامپیوتر
                </button>
              </div>
            </div>

            {/* Electrical Engineering Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-accent ml-3" />
                <h3 className="text-xl font-bold text-primary-foreground text-center space-y-1">مهندسی‌الکترونیک</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3 mb-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center opacity-60">
                  <div className="text-primary-foreground font-medium text-sm">
                   طراحی سخت‌افزار با FPGA
                  </div>
                </div>
                
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center opacity-60">
                  <div className="text-primary-foreground font-medium text-sm">
                    سیستم‌های کنترل
                  </div>
                </div>
                
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center opacity-60">
                  <div className="text-primary-foreground font-medium text-sm">
                    نقشه‌کشی مدارات فرمان و قدرت
                  </div>
                </div>
              </div>
              <Collapsible>
                <CollapsibleContent>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center opacity-60">
                    <div className="text-primary-foreground font-medium text-sm">
                      اتوماسیون صنعتی
                    </div>
                  </div>
                </CollapsibleContent>
                <div className="text-center mt-2">
                  <CollapsibleTrigger className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80">
                    <span className="data-[state=open]:hidden">نمایش بیشتر</span>
                    <span className="hidden data-[state=open]:inline">نمایش کمتر</span>
                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </Collapsible>
              
              <div className="text-center">
                <button 
                  disabled
                  className="text-primary-foreground/50 font-medium cursor-not-allowed text-sm"
                >
                  مشاهده‌خدمات مهندسی‌برق
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;