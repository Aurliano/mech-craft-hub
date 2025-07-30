import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Menu, X, Wrench, ChevronDown, ChevronLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const services = [
    { name: "طراحی", href: "/design" },
    { 
      name: "تحلیل و شبیه سازی", 
      href: "/analysis",
      subItems: [
        { 
          name: "تحلیل استاتیک", 
          href: "/analysis/static",
          subItems: [
            { name: "تحلیل تنش", href: "/analysis/static/stress" },
            { name: "تحلیل کرنش", href: "/analysis/static/strain" },
            { name: "تحلیل بار", href: "/analysis/static/load" }
          ]
        },
        { 
          name: "تحلیل داینامیک", 
          href: "/analysis/dynamic",
          subItems: [
            { name: "تحلیل ارتعاش", href: "/analysis/dynamic/vibration" },
            { name: "تحلیل مودال", href: "/analysis/dynamic/modal" }
          ]
        },
        { name: "حل مسئله", href: "/analysis/problem-solving" }
      ]
    },
    { 
      name: "نقشه کشی", 
      href: "/drawing",
      subItems: [
        { name: "نقشه مکانیکی", href: "/drawing/mechanical" },
        { name: "نقشه الکتریکی", href: "/drawing/electrical" }
      ]
    },
    { name: "ساخت", href: "/manufacturing" }
  ];

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Right Section: Logo and Menu */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={logo} alt="لوگو" className="h-16 w-auto" />
              <span className="text-xl font-bold">گروه صنعتی پدرام</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="/" className="hover:text-primary transition-colors">خانه</a>
            
            {/* Main Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:text-primary transition-colors flex items-center gap-1">
                  <Menu className="h-4 w-4" />
                  منو
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-elegant z-50 text-right">
                {/* Services with submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center justify-end hover:bg-muted hover:text-primary">
                    <span>خدمات</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56 bg-background border-border shadow-md z-50 text-right">
                    {services.map((service) => (
                      service.subItems ? (
                        <DropdownMenuSub key={service.name}>
                          <DropdownMenuSubTrigger className="flex items-center justify-end hover:bg-muted hover:text-primary">
                            <span>{service.name}</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="w-48 bg-card border-border shadow-elegant z-50 text-right">
                            {service.subItems.map((subItem) => (
                              subItem.subItems ? (
                                <DropdownMenuSub key={subItem.name}>
                                  <DropdownMenuSubTrigger className="flex items-center justify-end text-foreground hover:bg-muted hover:text-primary">
                                    <span>{subItem.name}</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="w-44 bg-card border-border shadow-elegant z-50 text-right">
                                    {subItem.subItems.map((thirdLevelItem) => (
                                      <DropdownMenuItem key={thirdLevelItem.name} asChild>
                                        <a href={thirdLevelItem.href} className="text-foreground hover:bg-muted hover:text-primary cursor-pointer text-right block w-full">
                                          {thirdLevelItem.name}
                                        </a>
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              ) : (
                                <DropdownMenuItem key={subItem.name} asChild>
                                  <a href={subItem.href} className="text-foreground hover:bg-muted hover:text-primary cursor-pointer">
                                    {subItem.name}
                                  </a>
                                </DropdownMenuItem>
                              )
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      ) : (
                        <DropdownMenuItem key={service.name} asChild>
                          <a href={service.href} className="text-foreground hover:bg-muted hover:text-primary cursor-pointer">
                            {service.name}
                          </a>
                        </DropdownMenuItem>
                      )
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator />
                
                {/* Portfolio */}
                <DropdownMenuItem asChild>
                  <a href="/portfolio" className="text-foreground hover:bg-muted hover:text-primary cursor-pointer">
                    نمونه کارها
                  </a>
                </DropdownMenuItem>
                
                {/* Contact */}
                <DropdownMenuItem asChild>
                  <button 
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-foreground hover:bg-muted hover:text-primary cursor-pointer w-full text-right"
                  >
                    تماس با ما
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>

          {/* Login/Register Buttons */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            <Link to="/login">
              <Button variant="outline" size="sm">
                ورود
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="sm">
                ثبت نام
              </Button>
            </Link>
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
                  <div key={service.name}>
                    <a
                      href={service.href}
                     className="block px-6 py-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {service.name}
                    </a>
                    {service.subItems && (
                      <div className="pr-4">
                        {service.subItems.map((subItem) => (
                          <div key={subItem.name}>
                            <a
                              href={subItem.href}
                              className="block px-8 py-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              {subItem.name}
                            </a>
                            {subItem.subItems && (
                              <div className="pr-4">
                                {subItem.subItems.map((thirdLevelItem) => (
                                  <a
                                    key={thirdLevelItem.name}
                                    href={thirdLevelItem.href}
                                    className="block px-12 py-1 text-xs text-muted-foreground/80 hover:text-primary transition-colors"
                                  >
                                    {thirdLevelItem.name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col space-y-2 px-3 pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  تماس با ما
                </Button>
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