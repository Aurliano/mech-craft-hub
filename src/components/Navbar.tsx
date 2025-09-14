import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Menu, X, ChevronDown, ChevronUp, User, ShoppingCart, Package, HelpCircle, LogOut, Home, LogIn, UserPlus, Bell, BarChart3, Wrench, Settings, Briefcase, MessageSquare, Building2 } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import UserDropdown from "@/components/UserDropdown";
import { useCheckContractorManufacturingService } from "@/hooks/useAuth";

interface SubItem {
  name: string;
  href: string;
  subItems?: SubItem[];
}

interface Service {
  name: string;
  href: string;
  subItems?: SubItem[];
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedServices, setExpandedServices] = useState<string[]>([]);
  
  // Use real authentication state
  const { isAuthenticated, user, logout, cartItems, notifications, stats, isContractor, isCustomer } = useAuth();
  const isMobile = useIsMobile();
  const { data: manufacturingCheck } = useCheckContractorManufacturingService();
  const userName = user?.username || "کاربر";
  const cartItemsCount = cartItems?.length || 0;
  const unreadNotificationsCount = notifications?.filter(n => !n.isRead)?.length || 0;

  const toggleService = (serviceName: string) => {
    setExpandedServices(prev => 
      prev.includes(serviceName) 
        ? prev.filter(name => name !== serviceName)
        : [...prev, serviceName]
    );
  };

  const services: Service[] = [
    { name: "طراحی و مدل سازی", href: "/design" },
    { 
      name: "تحلیل و شبیه سازی", 
      href: "/analysis",
      subItems: [
        { name: "تحلیل استاتیک", href: "/analysis?tab=static" },
        { name: "تحلیل داینامیک", href: "/analysis?tab=dynamic" },
        { name: "حل مسئله با کدنویسی", href: "/analysis?tab=coding" }
      ]
    },
    { name: "نقشه کشی صنعتی", href: "/drawing" },
    { name: "ساخت و تولید", href: "/manufacturing" }
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

                  {/* Contact */}
                  <NavigationMenuItem>
                    <button 
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      className={navigationMenuTriggerStyle()}
                    >
                      تماس با ما
                    </button>
                  </NavigationMenuItem>

                  {/* Services Page */}
                  <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/services">
                      خدمات ما
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Portfolio */}
                  <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/portfolio">
                      نمونه کارها
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Services Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50">
                      خدمات تخصصی
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
                  
                  {/* Home */}
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/" className={navigationMenuTriggerStyle()} title="خانه">
                        <Home className="h-5 w-5" />
                        <span className="sr-only">خانه</span>
                      </Link>
                    </NavigationMenuLink>
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
                <Button variant="ghost" size="sm" className="relative" asChild title="سبد خرید">
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="sr-only">سبد خرید</span>
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                </Button>

                {/* User Account Dropdown */}
                <UserDropdown 
                  userName={userName}
                  unreadNotificationsCount={unreadNotificationsCount}
                  onLogout={logout}
                />
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" title="ورود">
                    <LogIn className="h-5 w-5" />
                    <span className="sr-only">ورود</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm" title="ثبت نام">
                    <UserPlus className="h-5 w-5" />
                    <span className="sr-only">ثبت نام</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-colors"
              title={isOpen ? "بستن منو" : "باز کردن منو"}
              aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">{isOpen ? "بستن منو" : "باز کردن منو"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="max-h-[80vh] overflow-y-auto">
              <div className="px-3 py-4 space-y-3">
                {/* Home Link */}
                <Link 
                  to="/" 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-foreground hover:bg-muted hover:text-primary transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="font-medium flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    خانه
                  </span>
                </Link>

                
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
                      {/* Shopping Cart - Only for customers */}
                      {isCustomer && (
                      <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2" asChild>
                        <Link to="/cart" onClick={() => setIsOpen(false)}>
                          <ShoppingCart className="h-4 w-4" />
                          <span>سبد خرید</span>
                          {cartItemsCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {cartItemsCount}
                            </span>
                          )}
                        </Link>
                      </Button>
                      )}

                      {/* User Account Menu */}
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <User className="h-4 w-4" />
                          <div className="flex flex-col">
                          <span className="font-medium text-sm">{userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {isContractor ? 'پیمانکار' : isCustomer ? 'مشتری' : 'کاربر'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Common menu items */}
                        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                          <Link to="/profile" onClick={() => setIsOpen(false)}>
                            <User className="mr-2 h-4 w-4" />
                            اطلاعات حساب کاربری
                          </Link>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                          <Link to="/notifications" onClick={() => setIsOpen(false)}>
                            <Bell className="mr-2 h-4 w-4" />
                            اعلان ها
                            {unreadNotificationsCount > 0 && (
                              <span className="mr-auto bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                {unreadNotificationsCount}
                              </span>
                            )}
                          </Link>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                          <Link to="/support" onClick={() => setIsOpen(false)}>
                          <HelpCircle className="mr-2 h-4 w-4" />
                          پشتیبانی
                          </Link>
                        </Button>
                        
                        {/* Role-specific menu items */}
                        {isCustomer && (
                          <>
                            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                              <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                داشبورد
                              </Link>
                            </Button>
                            
                            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                              <Link to="/orders" onClick={() => setIsOpen(false)}>
                                <Package className="mr-2 h-4 w-4" />
                                سفارشات
                              </Link>
                            </Button>
                          </>
                        )}
                        
                        {isContractor && (
                          <>
                            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                              <Link to="/contractor-dashboard" onClick={() => setIsOpen(false)}>
                                <Briefcase className="mr-2 h-4 w-4" />
                                پنل پیمانکار
                              </Link>
                            </Button>
                            
                            {manufacturingCheck?.has_manufacturing_service && (
                              <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                                <Link to="/my-workshops" onClick={() => setIsOpen(false)}>
                                  <Building2 className="mr-2 h-4 w-4" />
                                  کارگاه‌های من
                                </Link>
                              </Button>
                            )}
                            
                            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                              <Link to="/contractor-dashboard?tab=projects" onClick={() => setIsOpen(false)}>
                                <Settings className="mr-2 h-4 w-4" />
                                پروژه‌های فعال
                              </Link>
                        </Button>
                          </>
                        )}
                        
                        <div className="pt-2 border-t border-border">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-destructive hover:text-destructive"
                          title="خروج از حساب"
                          onClick={() => {
                            logout();
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          خروج از حساب
                        </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full" title="ورود">
                          ورود
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsOpen(false)}>
                        <Button variant="default" size="sm" className="w-full" title="ثبت نام">
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