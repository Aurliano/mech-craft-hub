import { Wrench, Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";


const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="text-right" dir="rtl">
            <div className="flex items-center space-x-2 rtl:space-x-reverse justify-end mb-4">
              <span className="text-xl font-bold">پلتفرم مهندسی سایدا</span>
              <img src={logo} alt="لوگو" className="h-14 w-auto" />
            </div>
            <p className="text-primary-foreground/80 leading-relaxed" dir="rtl">
              ارائه‌دهنده خدمات جامع مهندسی مکانیک با استفاده از جدیدترین تکنولوژی‌ها و بالاترین کیفیت
            </p>
          </div>

          {/* Services */}
          <div className="text-right">
            <h3 className="font-semibold mb-4">خدمات</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="/design" className="hover:text-accent transition-colors">طراحی و مدل سازی</a></li>
              <li><a href="/analysis" className="hover:text-accent transition-colors">تحلیل و شبیه‌سازی</a></li>
              <li><a href="/drawing" className="hover:text-accent transition-colors">نقشه‌کشی صنعتی</a></li>
              <li><a href="/manufacturing" className="hover:text-accent transition-colors">ساخت و تولید</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="text-right">
            <h3 className="font-semibold mb-4">لینک‌های سریع</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="/" className="hover:text-accent transition-colors">خانه</a></li>
              <li><a href="/about" className="hover:text-accent transition-colors">درباره ما</a></li>
              <li><a href="/contact" className="hover:text-accent transition-colors">تماس با ما</a></li>
              <li><a href="/portfolio" className="hover:text-accent transition-colors">نمونه کارها</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-right">
            <h3 className="font-semibold mb-4">اطلاعات تماس</h3>
            <div className="space-y-3 text-primary-foreground/80">
              <div className="flex items-center justify-end">
                <span>اصفهان، ایران</span>
                <MapPin className="h-4 w-4 mr-2" />
              </div>
              <div className="flex items-center justify-end">
                <span>+98 21 1234 5678</span>
                <Phone className="h-4 w-4 mr-2" />
              </div>
              <div className="flex items-center justify-end">
                <span>info@mechcraft.com</span>
                <Mail className="h-4 w-4 mr-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
          <p>&copy; 1404 پلتفرم مکانیک سایدا. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;