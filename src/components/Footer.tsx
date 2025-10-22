import { Wrench, Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";


const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="text-right" dir="rtl">
            <div className="flex items-center space-x-2 rtl:space-x-reverse justify-end mb-3 sm:mb-4">
              <span className="text-lg sm:text-xl font-bold">پلتفرم مهندسی سایدا</span>
              <img src={logo} alt="لوگو" className="h-10 w-auto sm:h-14" />
            </div>
            <p className="text-primary-foreground/80 leading-relaxed text-sm sm:text-base" dir="rtl">
              ارائه‌دهنده خدمات جامع مهندسی مکاترونیک با استفاده از جدیدترین تکنولوژی‌ها و بالاترین کیفیت
            </p>
          </div>

          {/* Services */}
          <div className="text-right">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">خدمات</h3>
            <ul className="space-y-2 text-primary-foreground/80 text-sm sm:text-base">
              <li><a href="/design" className="hover:text-accent transition-colors">طراحی و مدل سازی</a></li>
              <li><a href="/analysis" className="hover:text-accent transition-colors">تحلیل و شبیه‌سازی</a></li>
              <li><a href="/drawing" className="hover:text-accent transition-colors">نقشه‌کشی صنعتی</a></li>
              <li><a href="/manufacturing" className="hover:text-accent transition-colors">ساخت و تولید</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="text-right">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">لینک‌های سریع</h3>
            <ul className="space-y-2 text-primary-foreground/80 text-sm sm:text-base">
              <li><a href="/" className="hover:text-accent transition-colors">خانه</a></li>
              <li><a href="/blog" className="hover:text-accent transition-colors">مقالات و منابع علمی</a></li>
              <li><a href="/services" className="hover:text-accent transition-colors">خدمات ما</a></li>
              <li><a href="/portfolio" className="hover:text-accent transition-colors">نمونه کارها</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-right">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">اطلاعات تماس</h3>
            <div className="space-y-2 sm:space-y-3 text-primary-foreground/80 text-sm sm:text-base">
              <div className="flex items-center justify-end">
                <span>اصفهان، خمینی شهر، منظریه، بلوار دانشجو، دانشگاه آزاداسلامی </span>
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              </div>
              <div className="flex items-center justify-end">
                <span>03133660207</span>
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              </div>
              <div className="flex items-center justify-end">
                <span>info@saydatech.ir</span>
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-primary-foreground/60 text-sm sm:text-base">
          <p>&copy; 1404 پلتفرم مهندسی سایدا. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
      
      {/* Trust Badges Section */}
      <div className="bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-6">نمادها و مجوزها</h3>
            <div className="flex justify-center items-center">
              <a href="https://bitpay.ir/certificate-646830-saydatech.ir" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://bitpay.ir/theme/public/images/trusted-logo.svg" 
                  alt="نماد اعتماد بیت پی" 
                  className="h-16 w-auto hover:opacity-80 transition-opacity"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;