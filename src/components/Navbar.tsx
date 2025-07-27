import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, Wrench } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const services = [
    { name: "طراحی", href: "/design" },
    { name: "تحلیل و شبیه سازی", href: "/analysis" },
    { name: "نقشه کشی", href: "/drawing" },
    { name: "ساخت", href: "/manufacturing" }
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Wrench className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">مکانیک کرافت</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <a href="/" className="text-foreground hover:text-primary transition-colors">خانه</a>
            
            {/* Services Dropdown */}
            <div className="relative group">
              <button className="text-foreground hover:text-primary transition-colors flex items-center">
                خدمات
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-elegant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                {services.map((service) => (
                  <a
                    key={service.name}
                    href={service.href}
                    className="block px-4 py-2 text-foreground hover:bg-muted hover:text-primary transition-colors"
                  >
                    {service.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button variant="outline" size="sm">
                ورود
              </Button>
              <Button variant="hero" size="sm">
                ثبت نام
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="/" className="block px-3 py-2 text-foreground hover:text-primary transition-colors">خانه</a>
              
              <div className="space-y-1">
                <div className="px-3 py-2 text-muted-foreground font-medium">خدمات</div>
                {services.map((service) => (
                  <a
                    key={service.name}
                    href={service.href}
                    className="block px-6 py-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    {service.name}
                  </a>
                ))}
              </div>
              
              <div className="flex flex-col space-y-2 px-3 pt-4">
                <Button variant="outline" size="sm">
                  ورود
                </Button>
                <Button variant="hero" size="sm">
                  ثبت نام
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;