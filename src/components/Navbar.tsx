import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Menu, X, ChevronDown, ChevronUp, User, ShoppingCart, Package, HelpCircle, LogOut, Home, LogIn, UserPlus, Bell, BarChart3, Wrench, Settings, Briefcase, MessageSquare, Building2, BookOpen, Briefcase as BriefcaseIcon, Phone } from "lucide-react";
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
  const unreadNotificationsCount = notifications?.filter((n: { isRead?: boolean }) => !n.isRead)?.length || 0;

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
    <nav className="bg-background border-b border-border sticky top-0 z-50" dir="rtl">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="flex flex-col" dir="rtl">
          {/* Top Section: Logo and Site Name */}
          <div className="flex justify-end items-center py-2 border-b border-border/50" dir="rtl">
            <div className="flex items-center gap-3" dir="rtl">
              <img src={logo} alt="لوگو" className="h-10 w-auto flex-shrink-0" />
              <span className="text-xl font-bold text-primary">پلتفرم مهندسی سایدا</span>
            </div>
          </div>
          
          {/* Main Navigation */}
          <div className="flex justify-end items-center h-16" dir="rtl">
            {/* Desktop Layout */}
            <div className="hidden lg:flex justify-end items-center w-full gap-4" dir="rtl">
              {/* Navigation Menu Items */}
              <NavigationMenu className="bg-transparent" dir="rtl">
                <NavigationMenuList className="gap-2" dir="rtl">
                  {/* Home */}
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/" className={navigationMenuTriggerStyle()} title="خانه">
                        <Home className="h-4 w-4 ml-2" />
                        خانه
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Services Dropdown */}
                  <NavigationMenuItem dir="rtl">
                    <NavigationMenuTrigger className="bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50">
                      <Wrench className="h-4 w-4 ml-2" />
                      خدمات تخصصی
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-card/95 backdrop-blur-sm border border-border/50 shadow-elegant">
                      <div className="w-[400px] p-4">
                        <div className="grid grid-cols-1 gap-4" dir="rtl">
                          {services.map((service) => (
                            <div key={service.name} className="group">
                              {service.subItems ? (
                                <div>
                                  <h3 className="text-sm font-medium text-foreground mb-2 px-3 py-2 bg-muted/30 rounded-md">
                                    {service.name}
                                  </h3>
                                  <div className="grid grid-cols-1 gap-1 mr-4" dir="rtl">
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

                  {/* Blog */}
                  <NavigationMenuItem dir="rtl">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/blog">
                      <BookOpen className="h-4 w-4 ml-2" />
                      مقالات و منابع علمی
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Portfolio */}
                  <NavigationMenuItem dir="rtl">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/portfolio">
                      <Briefcase className="h-4 w-4 ml-2" />
                      نمونه کارها
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Services Page */}
                  <NavigationMenuItem dir="rtl">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/services">
                      <BriefcaseIcon className="h-4 w-4 ml-2" />
                      خدمات ما
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Contact */}
                  <NavigationMenuItem dir="rtl">
                    <button 
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      className={navigationMenuTriggerStyle()}
                    >
                      <Phone className="h-4 w-4 ml-2" />
                      تماس با ما
                    </button>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <>
                  {/* Admin Shortcut */}
                  {((user as unknown as Record<string, unknown>)?.role === 'admin') || ((user as unknown as { role?: { name?: string } }).role?.name === 'admin') ? (
                    <Button variant="outline" size="sm" asChild title="داشبورد مدیر">
                      <Link to="/admin/dashboard">داشبورد مدیر</Link>
                    </Button>
                  ) : null}
                  {/* Shopping Cart */}
                  {isCustomer && (
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
                  )}

                  {/* User Account Dropdown */}
                  <UserDropdown 
                    userName={userName}
                    unreadNotificationsCount={unreadNotificationsCount}
                    onLogout={logout}
                  />
                </>
              ) : (
                <>
                  <Link to="/contractor-register">
                    <Button variant="default" size="sm" title="ثبت نام پیمانکاران و کارگاه ها" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      ثبت نام پیمانکاران و کارگاه ها
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="sm" title="ورود" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      ورود
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline" size="sm" title="ثبت نام" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      ثبت نام
                    </Button>
                  </Link>
                </>
              )}
            </div>

          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden flex items-center justify-between w-full">
            {/* Mobile menu button - Right side */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-colors p-2"
              title={isOpen ? "بستن منو" : "باز کردن منو"}
              aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">{isOpen ? "بستن منو" : "باز کردن منو"}</span>
            </button>
            
            {/* Mobile Logo and Site Name - Center */}
            <div className="flex items-center gap-2" dir="rtl">
              <img src={logo} alt="لوگو" className="h-8 w-auto flex-shrink-0" />
              <span className="text-sm font-bold truncate">پلتفرم مهندسی سایدا</span>
            </div>
            
            
          </div>
        </div>

        {/* Mobile Menu - Right aligned */}
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
            <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl" dir="rtl" onClick={(e) => e.stopPropagation()}>
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <img src={logo} alt="لوگو" className="h-8 w-auto" />
                  <span className="font-bold text-sm">پلتفرم مهندسی سایدا</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="بستن منو"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* User Profile Section */}
              {isAuthenticated ? (
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{userName}</span>
                      <span className="text-xs text-gray-500">
                        {isContractor ? 'پیمانکار' : isCustomer ? 'مشتری' : 'کاربر'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">به پلتفرم مهندسی سایدا خوش آمدید</span>
                      <span className="text-xs opacity-90">برای شروع وارد شوید</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Menu */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 space-y-2">
                  {/* Home Link */}
                  <Link 
                    to="/" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Home className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">خانه</span>
                  </Link>

                  {/* Services Section */}
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleService('services')}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Wrench className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">خدمات تخصصی</span>
                      </div>
                      {expandedServices.includes('services') ? 
                        <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      }
                    </button>
                    
                    {expandedServices.includes('services') && (
                      <div className="px-3 pb-3 space-y-1">
                        {services.map((service) => (
                          <div key={service.name} className="bg-white rounded-md overflow-hidden">
                            {service.subItems ? (
                              <div>
                                <button
                                  onClick={() => toggleService(service.name)}
                                  className="w-full flex items-center justify-between p-2 text-sm hover:bg-gray-50 transition-colors"
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
                                          <div className="bg-gray-50 rounded-sm overflow-hidden">
                                            <button
                                              onClick={() => toggleService(subItem.name)}
                                              className="w-full flex items-center justify-between p-2 text-xs text-gray-600 hover:text-primary transition-colors"
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
                                                    className="block p-1 text-xs text-gray-500 hover:text-primary transition-colors"
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
                                            className="block p-2 text-xs text-gray-600 hover:text-primary transition-colors rounded-sm hover:bg-gray-50"
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
                                className="block p-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
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

                  {/* Other Navigation Links */}
                  <Link 
                    to="/blog" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <BookOpen className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">مقالات و منابع علمی</span>
                  </Link>

                  <Link 
                    to="/portfolio" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Briefcase className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">نمونه کارها</span>
                  </Link>

                  <Link 
                    to="/services" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <BriefcaseIcon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">خدمات ما</span>
                  </Link>

                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">تماس با ما</span>
                  </button>
                </div>

                {/* Auth Section */}
                <div className="px-4 pt-4 border-t border-gray-200 mt-4">
                  {isAuthenticated ? (
                    <div className="space-y-2">
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

                      {/* User Menu Items */}
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
                          
                          {(manufacturingCheck as { has_manufacturing_service?: boolean })?.has_manufacturing_service && (
                            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                              <Link to="/my-workshops" onClick={() => setIsOpen(false)}>
                                <Building2 className="mr-2 h-4 w-4" />
                                کارگاه‌های من
                              </Link>
                            </Button>
                          )}
                        </>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        خروج از حساب
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link to="/contractor-register" onClick={() => setIsOpen(false)}>
                        <Button variant="default" size="lg" className="w-full flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          ثبت نام پیمانکاران و کارگاه ها
                        </Button>
                      </Link>
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          ورود
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          ثبت نام
                        </Button>
                      </Link>
                    </div>
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