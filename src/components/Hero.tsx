import { Button } from "@/components/ui/button";
import { ArrowLeft, Cog, Users, Award } from "lucide-react";
import heroImage from "@/assets/hero-engineering.jpg";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-primary/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            مهندسی مکانیک
            <br />
            <span className="bg-gradient-to-r from-accent to-primary-glow bg-clip-text text-transparent">
              با کیفیت بالا
            </span>
          </h1>
          
          <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            ما متخصص در ارائه خدمات مهندسی مکانیک شامل طراحی، تحلیل، نقشه‌کشی و ساخت قطعات صنعتی هستیم. 
            با استفاده از جدیدترین تکنولوژی‌ها و نرم‌افزارهای مهندسی، پروژه‌های شما را با بالاترین کیفیت انجام می‌دهیم.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button variant="hero" size="lg" className="group">
              شروع پروژه
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-primary">
              مشاهده خدمات
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <Cog className="h-8 w-8 text-accent" />
              </div>
              <div className="text-2xl font-bold text-primary-foreground">۵۰۰+</div>
              <div className="text-primary-foreground/80">پروژه موفق</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <div className="text-2xl font-bold text-primary-foreground">۲۰۰+</div>
              <div className="text-primary-foreground/80">مشتری راضی</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <div className="text-2xl font-bold text-primary-foreground">۱۰+</div>
              <div className="text-primary-foreground/80">سال تجربه</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;