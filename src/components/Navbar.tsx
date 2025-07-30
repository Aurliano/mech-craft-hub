import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Menu, X, Wrench, ChevronDown, ChevronLeft, ChevronUp } from "lucide-react";
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
  const [expandedServices, setExpandedServices] = useState<string[]>([]);

  const toggleService = (serviceName: string) => {
    setExpandedServices(prev => 
      prev.includes(serviceName) 
        ? prev.filter(name => name !== serviceName)
        : [...prev, serviceName]
    );
  };

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
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="max-h-[80vh] overflow-y-auto">
              <div className="px-3 py-4 space-y-3">
                {/* Home Link */}
                <a 
                  href="/" 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-foreground hover:bg-muted hover:text-primary transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="font-medium">خانه</span>
                </a>
                
                {/* Services Section */}
                <div className="bg-muted/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleService('services')}
                    className="w-full flex items-center justify-between p-3 text-foreground hover:bg-muted transition-colors"
                  >
                    <span className="font-medium">خدمات</span>
                    {expandedServices.includes('services') ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </button>
                  
                  {expandedServices.includes('services') && (
                    <div className="px-3 pb-3 space-y-2">
                      {services.map((service) => (
                        <div key={service.name} className="bg-background rounded-md overflow-hidden">
                          {service.subItems ? (
                            <div>
                              <button
                                onClick={() => toggleService(service.name)}
                                className="w-full flex items-center justify-between p-2 text-sm text-foreground hover:bg-muted transition-colors"
                              >
                                <span>{service.name}</span>
                                {expandedServices.includes(service.name) ? 
                                  <ChevronUp className="h-3 w-3" /> : 
                                  <ChevronDown className="h-3 w-3" />
                                }
                              </button>
                              
                              {expandedServices.includes(service.name) && (
                                <div className="px-2 pb-2 space-y-1">
                                  {service.subItems.map((subItem) => (
                                    <div key={subItem.name}>
                                      {subItem.subItems ? (
                                        <div className="bg-muted/30 rounded-sm overflow-hidden">
                                          <button
                                            onClick={() => toggleService(subItem.name)}
                                            className="w-full flex items-center justify-between p-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                                          >
                                            <span>{subItem.name}</span>
                                            {expandedServices.includes(subItem.name) ? 
                                              <ChevronUp className="h-3 w-3" /> : 
                                              <ChevronDown className="h-3 w-3" />
                                            }
                                          </button>
                                          
                                          {expandedServices.includes(subItem.name) && (
                                            <div className="px-2 pb-1 space-y-1">
                                              {subItem.subItems.map((thirdLevelItem) => (
                                                <a
                                                  key={thirdLevelItem.name}
                                                  href={thirdLevelItem.href}
                                                  className="block p-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                                  onClick={() => setIsOpen(false)}
                                                >
                                                  • {thirdLevelItem.name}
                                                </a>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <a
                                          href={subItem.href}
                                          className="block p-2 text-xs text-muted-foreground hover:text-primary transition-colors rounded-sm hover:bg-muted/50"
                                          onClick={() => setIsOpen(false)}
                                        >
                                          {subItem.name}
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <a
                              href={service.href}
                              className="block p-2 text-sm text-foreground hover:text-primary hover:bg-muted transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              {service.name}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Portfolio Link */}
                <a 
                  href="/portfolio" 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-foreground hover:bg-muted hover:text-primary transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="font-medium">نمونه کارها</span>
                </a>

                {/* Contact Button */}
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 text-foreground hover:bg-muted hover:text-primary transition-all duration-200"
                >
                  <span className="font-medium">تماس با ما</span>
                </button>

                {/* Auth Buttons */}
                <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      ورود
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button variant="default" size="sm" className="w-full">
                      ثبت نام
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;