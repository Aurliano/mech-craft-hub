import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Menu, X, ChevronDown, ChevronUp, User, ShoppingCart, Package, HelpCircle, LogOut, Home, LogIn, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedServices, setExpandedServices] = useState<string[]>([]);
  
  // Mock authentication state - replace with real auth logic
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName] = useState("احمد محمدی"); // Mock user name

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
              <span className="text-xl font-bold">پلتفرم مهندسی سایدا</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center">
              <NavigationMenu className="bg-transparent">
                <NavigationMenuList className="gap-1">
                  {/* Home */}
                  <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/">
                      <Home className="h-5 w-5" />
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Services */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50">
                      خدمات
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-card/95 backdrop-blur-sm border border-border/50 shadow-elegant">
                      <div className="w-[400px] p-4">
                        <div className="grid grid-cols-1 gap-4">
                          {services.map((service) => (
                            <div key={service.name} className="group">
                              {service.subItems ? (
                                <div>
                                  <h3 className="text-sm font-medium text-foreground mb-2 px-3 py-2 bg-muted/30 rounded-md">
                                    {service.name}
                                  </h3>
                                  <div className="grid grid-cols-1 gap-1 mr-4">
                                    {service.subItems.map((subItem) => (
                                      <div key={subItem.name}>
                                        {subItem.subItems ? (
                                          <div className="mb-2">
                                            <h4 className="text-xs font-medium text-muted-foreground mb-1 px-2 py-1">
                                              {subItem.name}
                                            </h4>
                                            <div className="grid grid-cols-1 gap-1 mr-4">
                                              {subItem.subItems.map((thirdLevel) => (
                                                <NavigationMenuLink
                                                  key={thirdLevel.name}
                                                  href={thirdLevel.href}
                                                  className="block px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-muted/30 rounded transition-colors"
                                                >
                                                  • {thirdLevel.name}
                                                </NavigationMenuLink>
                                              ))}
                                            </div>
                                          </div>
                                        ) : (
                                          <NavigationMenuLink
                                            href={subItem.href}
                                            className="block px-2 py-2 text-sm text-foreground hover:text-primary hover:bg-muted/50 rounded transition-colors"
                                          >
                                            {subItem.name}
                                          </NavigationMenuLink>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <NavigationMenuLink
                                  href={service.href}
                                  className="block px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted/50 rounded transition-colors"
                                >
                                  {service.name}
                                </NavigationMenuLink>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Portfolio */}
                  <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/portfolio">
                      نمونه کارها
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Contact */}
                  <NavigationMenuItem>
                    <button 
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      className={navigationMenuTriggerStyle()}
                    >
                      تماس با ما
                    </button>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            {isAuthenticated ? (
              <>
                {/* Shopping Cart */}
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* User Account Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          حساب کاربری
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Package className="mr-2 h-4 w-4" />
                      <span>سفارشات</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>پشتیبانی</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsAuthenticated(false)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>خروج از حساب</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    <LogIn className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </Link>
                {/* Test Login Button */}
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setIsAuthenticated(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  تست ورود
                </Button>
              </>
            )}
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
                  <span className="font-medium flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    خانه
                  </span>
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

                {/* Auth Buttons / User Menu */}
                <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                  {isAuthenticated ? (
                    <>
                      {/* Shopping Cart */}
                      <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        <span>سبد خرید</span>
                        <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          3
                        </span>
                      </Button>

                      {/* User Account Menu */}
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <User className="h-4 w-4" />
                          <span className="font-medium text-sm">{userName}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Package className="mr-2 h-4 w-4" />
                          سفارشات
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <HelpCircle className="mr-2 h-4 w-4" />
                          پشتیبانی
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-destructive hover:text-destructive"
                          onClick={() => {
                            setIsAuthenticated(false);
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          خروج از حساب
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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