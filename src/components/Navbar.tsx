import { Button } from "@/components/ui/button";
import { useState } from "react";
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
        { name: "تحلیل استاتیک", href: "/analysis/static" },
        { name: "تحلیل داینامیک", href: "/analysis/dynamic" },
        { name: "حل مسئله", href: "/analysis/problem-solving" }
      ]
    },
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  خدمات
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-md border-border shadow-elegant">
                {services.map((service) => (
                  service.subItems ? (
                    <DropdownMenuSub key={service.name}>
                      <DropdownMenuSubTrigger className="flex items-center justify-between text-foreground hover:bg-muted hover:text-primary">
                        <span>{service.name}</span>
                        <ChevronLeft className="h-4 w-4" />
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-48 bg-card/95 backdrop-blur-md border-border shadow-elegant">
                        {service.subItems.map((subItem) => (
                          <DropdownMenuItem key={subItem.name} asChild>
                            <a href={subItem.href} className="text-foreground hover:bg-muted hover:text-primary cursor-pointer">
                              {subItem.name}
                            </a>
                          </DropdownMenuItem>
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
              </DropdownMenuContent>
            </DropdownMenu>

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
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-8 py-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
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