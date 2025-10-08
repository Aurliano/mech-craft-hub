import { Button } from "@/components/ui/button";
import { ArrowLeft, Cog, Brain, Zap, Globe, LaptopIcon, CircuitBoardIcon } from "lucide-react"; // Added Globe icon
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-engineering.png";
import MetaIcon from "@/assets/icons8-meta.svg"; // Importing the Meta icon

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = heroImage;
    img.onload = () => setImageLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden"> {/* Changed to flex-col and justify-center */}
      {/* Background Image */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse">
          <div className="absolute inset-0 bg-primary/80"></div>
        </div>
      )}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="تصویر پس‌زمینه مهندسی"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-primary/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2 py-8 sm:py-16"> {/* Added responsive py-8 sm:py-16 */}
        <div className="max-w-3xl mx-auto"> {/* This div now only contains the text and buttons */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-primary-foreground mb-4 sm:mb-6 leading-tight space-y-2 sm:space-y-4 font-yekan">
            پلتفرم جامع مهندسی مکاترونیک 
            <br />
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-accent bg-gradient-to-r from-accent via-yellow-700 to-accent bg-clip-text text-transparent font-yekan block">
              طراحی، تحلیل و ساخت پروژه‌های مهندسی
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-6 sm:mb-8 leading-relaxed">
            با استفاده از جدیدترین تکنولوژی‌ها و نرم‌افزارهای مهندسی، پروژه‌های شما را با بالاترین کیفیت انجام می‌دهیم
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center">
            <Button variant="hero" size="lg" className="group" asChild>
              <Link to="/contractor-register">
                ثبت نام پیمانکاران و کارگاه ها
                <ArrowLeft className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-primary"
              asChild
            >
              <Link to="/services">
                مشاهده خدمات
              </Link>
            </Button>
          </div>
        </div>

        {/* Services Cards - Moved outside the max-w-3xl div and adjusted grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8"> {/* Improved responsive grid */}
          {/* Mechanical Engineering Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <Cog className="h-6 w-6 sm:h-8 sm:w-8 text-accent ml-2 sm:ml-3" />
              <h3 className="text-lg sm:text-xl font-bold text-primary-foreground text-center">مهندسی مکانیک</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <a 
                href="/design" 
                className="bg-white/5 hover:bg-white/15 p-2 sm:p-3 rounded-lg border border-white/10 transition-all duration-300 hover:border-accent/50 text-center group"
              >
                <div className="text-primary-foreground font-medium group-hover:text-accent transition-colors text-xs sm:text-sm">
                  طراحی و مدل‌سازی
                </div>
              </a>
              
              <a 
                href="/analysis" 
                className="bg-white/5 hover:bg-white/15 p-2 sm:p-3 rounded-lg border border-white/10 transition-all duration-300 hover:border-accent/50 text-center group"
              >
                <div className="text-primary-foreground font-medium group-hover:text-accent transition-colors text-xs sm:text-sm">
                  تحلیل و شبیه‌سازی
                </div>
              </a>
              
              <a 
                href="/drawing" 
                className="bg-white/5 hover:bg-white/15 p-2 sm:p-3 rounded-lg border border-white/10 transition-all duration-300 hover:border-accent/50 text-center group"
              >
                <div className="text-primary-foreground font-medium group-hover:text-accent transition-colors text-xs sm:text-sm">
                  نقشه‌کشی صنعتی
                </div>
              </a>
              
              <a 
                href="/manufacturing" 
                className="bg-white/5 hover:bg-white/15 p-2 sm:p-3 rounded-lg border border-white/10 transition-all duration-300 hover:border-accent/50 text-center group"
              >
                <div className="text-primary-foreground font-medium group-hover:text-accent transition-colors text-xs sm:text-sm">
                  ساخت و تولید
                </div>
              </a>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => {
                  const servicesSection = document.getElementById('services');
                  servicesSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-accent hover:text-accent/80 font-medium transition-colors underline text-xs sm:text-sm"
              >
                مشاهده خدمات مهندسی مکانیک
              </button>
            </div>
          </div>

          {/* Computer Engineering Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20 relative">
            <span className="absolute -top-2 -right-2 text-xs font-semibold bg-yellow-400/90 text-black px-2 py-0.5 rounded z-10">بزودی...</span>
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <LaptopIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent ml-2 sm:ml-3" />
              <h3 className="text-lg sm:text-xl font-bold text-primary-foreground text-center">مهندسی کامپیوتر</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10 text-center opacity-60">
                <div className="text-primary-foreground font-medium text-xs sm:text-sm">
                  طراحی وب
                </div>
              </div>
              
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10 text-center opacity-60">
                <div className="text-primary-foreground font-medium text-xs sm:text-sm">
                  هوش مصنوعی و علم داده
                </div>
              </div>
              
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10 text-center opacity-60">
                <div className="text-primary-foreground font-medium text-xs sm:text-sm">
                  برنامه نویسی
                </div>
              </div>
              
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10 text-center opacity-60">
                <div className="text-primary-foreground font-medium text-xs sm:text-sm">
                  طراحی اپلیکیشن موبایل
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button 
                disabled
                className="text-primary-foreground/50 font-medium cursor-not-allowed text-xs sm:text-sm"
              >
                مشاهده‌خدمات‌مهندسی‌کامپیوتر
              </button>
            </div>
          </div>

          {/* Electrical Engineering Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20 relative">
            <span className="absolute -top-2 -right-2 text-xs font-semibold bg-yellow-400/90 text-black px-2 py-0.5 rounded z-10">بزودی...</span>
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <CircuitBoardIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent ml-2 sm:ml-3" />
              <h3 className="text-lg sm:text-xl font-bold text-primary-foreground text-center ">مهندسی‌الکترونیک</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10 text-center opacity-60">
                <div className="text-primary-foreground font-medium text-xs sm:text-sm">
                 طراحی سخت‌افزار با FPGA
                </div>
              </div>
              
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10 text-center opacity-60">
                <div className="text-primary-foreground font-medium text-xs sm:text-sm">
                  سیستم‌های کنترل
                </div>
              </div>
              
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10 text-center opacity-60">
                <div className="text-primary-foreground font-medium text-xs sm:text-sm">
                  نقشه‌کشی مدارات فرمان و قدرت
                </div>
              </div>
              
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10 text-center opacity-60">
                <div className="text-primary-foreground font-medium text-xs sm:text-sm">
                  اتوماسیون صنعتی
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button 
                disabled
                className="text-primary-foreground/50 font-medium cursor-not-allowed text-xs sm:text-sm"
              >
                مشاهده‌خدمات مهندسی‌برق
              </button>
            </div>
          </div>

          {/* Metaverse Card - New */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20 relative">
            <span className="absolute -top-2 -right-2 text-xs font-semibold bg-yellow-400/90 text-black px-2 py-0.5 rounded z-10">بزودی...</span>
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <img src={MetaIcon} alt="آیکون متاورس" className="h-6 w-6 sm:h-8 sm:w-8 text-accent ml-2 sm:ml-3" />
              <h3 className="text-lg sm:text-xl font-bold text-primary-foreground text-center">متاورس</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10 text-center opacity-60">
                <div className="text-primary-foreground font-medium text-xs sm:text-sm">
                  VR
                </div>
              </div>
              
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10 text-center opacity-60">
                <div className="text-primary-foreground font-medium text-xs sm:text-sm">
                  AR
                </div>
              </div>
              
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10 text-center opacity-60">
                <div className="text-primary-foreground font-medium text-xs sm:text-sm">
                  واقعیت ترکیبی
                </div>
              </div>
              
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10 text-center opacity-60">
                <div className="text-primary-foreground font-medium text-xs sm:text-sm">
                  انیمیشن و گرافیک
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button 
                disabled
                className="text-primary-foreground/50 font-medium cursor-not-allowed text-xs sm:text-sm"
              >
                مشاهده خدمات متاورس
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
