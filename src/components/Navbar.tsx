import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Menu, X, ChevronDown, ChevronUp, User, ShoppingCart, Package, HelpCircle, LogOut, Home, LogIn, UserPlus, Bell, BarChart3, Wrench, Settings, Briefcase, MessageSquare, Building2, BookOpen, Briefcase as BriefcaseIcon, Phone, Plus } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
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
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import UserDropdown from "@/components/UserDropdown";
import InstallButton from "@/components/InstallButton";
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

  // کنترل اسکرول body هنگام باز/بسته شدن منو موبایل
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    // تمیز کردن هنگام unmount
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isOpen]);
  
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
    { name: "ساخت و تولید", href: "/manufacturing" },
    { name: "بازار کار", href: "/job-market" }
  ];

  return (
    <nav className="bg-background border-b border-border fixed top-0 left-0 right-0 z-50" dir="rtl">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-col" dir="rtl">
          {/* Top Section: Logo/Site Name (right) and Auth buttons (left) */}
          <div className="flex justify-between items-center py-2 border-b border-border/50" dir="rtl">
                {/* Logo and Site Name - Right side */}
                <div className="flex items-center gap-3" dir="rtl">
                  <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img src={logo} alt="لوگو" className="h-12 w-auto flex-shrink-0" />
                    <span className="text-2xl font-bold text-primary">پلتفرم مهندسی سایدا</span>
                  </Link>
                </div>
            
            {/* Auth Buttons - Left side */}
            <div className="flex items-center gap-2">
              {!isAuthenticated ? (
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
              ) : (
                <>
                  {/* Admin Shortcut */}
                  {user && ((((user as unknown as Record<string, unknown>)?.role) === 'admin') || ((user as unknown as { role?: { name?: string } }).role?.name === 'admin')) ? (
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
              )}
            </div>
          </div>
          
          {/* Main Navigation - Centered */}
          <div className="flex justify-center items-center h-16" dir="rtl">
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

                {/* Services Dropdown - Redesigned with multi-level hierarchy */}
                <NavigationMenuItem dir="rtl">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50")}>
                        <Wrench className="h-4 w-4 ml-2" />
                        خدمات تخصصی
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-[280px] p-2 bg-amber-50/50 border border-amber-200/50 shadow-lg"
                      sideOffset={5}
                    >
                      <div className="space-y-1" dir="rtl">
                        {services.map((service, index) => (
                          <React.Fragment key={service.name}>
                            {service.subItems ? (
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger 
                                  className="flex items-center justify-between w-full bg-amber-100/60 hover:bg-amber-200/60 text-foreground px-3 py-2 rounded-md transition-colors"
                                >
                                  <span>{service.name}</span>
                                  <Plus className="h-3 w-3" />
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent 
                                  className="w-[260px] bg-amber-200/60 border border-amber-300/60 shadow-lg"
                                >
                                  <div className="space-y-1 p-1" dir="rtl">
                                    {service.subItems.map((subItem) => (
                                      <React.Fragment key={subItem.name}>
                                        {subItem.subItems ? (
                                          <DropdownMenuSub>
                                            <DropdownMenuSubTrigger 
                                              className="flex items-center justify-between w-full bg-amber-300/60 hover:bg-amber-400/60 text-foreground px-3 py-2 rounded-md transition-colors text-sm"
                                            >
                                              <span>{subItem.name}</span>
                                              <Plus className="h-3 w-3" />
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent 
                                              className="w-[240px] bg-amber-400/60 border border-amber-500/60 shadow-lg"
                                            >
                                              <div className="space-y-1 p-1" dir="rtl">
                                                {subItem.subItems.map((thirdLevel) => (
                                                  <DropdownMenuItem 
                                                    key={thirdLevel.name} 
                                                    asChild
                                                    className="bg-amber-500/60 hover:bg-amber-600/60 text-foreground px-3 py-2 rounded-md transition-colors text-xs"
                                                  >
                                                    <Link to={thirdLevel.href}>
                                                      {thirdLevel.name}
                                                    </Link>
                                                  </DropdownMenuItem>
                                                ))}
                                              </div>
                                            </DropdownMenuSubContent>
                                          </DropdownMenuSub>
                                        ) : (
                                          <DropdownMenuItem 
                                            asChild
                                            className="bg-amber-300/60 hover:bg-amber-400/60 text-foreground px-3 py-2 rounded-md transition-colors text-sm"
                                          >
                                            <Link to={subItem.href}>
                                              {subItem.name}
                                            </Link>
                                          </DropdownMenuItem>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </div>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            ) : (
                              <DropdownMenuItem 
                                asChild
                                className="bg-amber-100/60 hover:bg-amber-200/60 text-foreground px-3 py-2 rounded-md transition-colors"
                              >
                                <Link to={service.href}>
                                  {service.name}
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {index < services.length - 1 && <DropdownMenuSeparator className="my-1 bg-amber-200/40" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            
            {/* Install Button */}
            <InstallButton variant="outline" size="sm" />
          </div>
        </div>

        {/* Mobile Layout - Simple single row */}
        <div className="lg:hidden flex items-center justify-between py-3" dir="rtl">
                {/* Mobile Logo and Site Name - Right side */}
                <div className="flex items-center gap-2" dir="rtl">
                  <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src={logo} alt="لوگو" className="h-10 w-auto flex-shrink-0" />
                    <span className="text-xl font-bold truncate">پلتفرم مهندسی سایدا</span>
                  </Link>
                </div>
          
          {/* Mobile menu button - Left side */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground hover:text-primary transition-colors p-2"
            title={isOpen ? "بستن منو" : "باز کردن منو"}
            aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">{isOpen ? "بستن منو" : "باز کردن منو"}</span>
          </button>
        </div>

              {/* Mobile Menu - Fixed overlay with proper scrolling */}
              {isOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                  {/* Backdrop */}
                  <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                    onClick={() => setIsOpen(false)}
                  />
                  
                  {/* Menu Panel */}
                  <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl overflow-hidden" dir="rtl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
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

                    {/* Scrollable Content */}
                    <div className="h-full overflow-y-auto overscroll-contain" style={{ height: 'calc(100vh - 80px)' }}>
                {/* User Profile Section */}
                {isAuthenticated ? (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-base">{userName}</span>
                        <span className="text-sm opacity-90">
                          {isContractor ? 'پیمانکار' : isCustomer ? 'مشتری' : 'کاربر'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-base">به پلتفرم مهندسی سایدا خوش آمدید</span>
                        <span className="text-sm opacity-90">برای شروع وارد شوید</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Menu */}
                <div className="px-4 py-4 space-y-1">
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

                  {/* Install Button for Mobile */}
                  <div className="px-3 py-2">
                    <InstallButton variant="outline" size="sm" className="w-full" />
                  </div>
                </div>

                {/* Auth Section */}
                <div className="px-4 pt-4 border-t border-gray-200 mt-4 pb-8">
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