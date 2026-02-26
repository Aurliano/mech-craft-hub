import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, ChevronDown, Bell, HelpCircle, BarChart3, Package, 
  Briefcase, Settings, LogOut, Building2, ShoppingCart, MessageSquare, FileText, 
  FolderOpen, Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCheckContractorManufacturingService } from '@/hooks/useAuth';

interface UserDropdownProps {
  userName: string;
  unreadNotificationsCount: number;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ 
  userName, 
  unreadNotificationsCount, 
  onLogout 
}) => {
  const { isContractor, isCustomer, user } = useAuth();
  const isMobile = useIsMobile();
  const { data: manufacturingCheck } = useCheckContractorManufacturingService();
  const hasCustomerAccess = isCustomer || isContractor;
  
  // Check if user is admin without using any
  type PossibleRole = string | { name?: string } | undefined;
  const role: PossibleRole = (user as unknown as { role?: PossibleRole })?.role;
  const roleName = typeof role === 'string' ? role : role?.name;
  const isAdmin = roleName === 'admin' || (user as unknown as { is_staff?: boolean })?.is_staff === true || (user as unknown as { is_superuser?: boolean })?.is_superuser === true;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2" title="منوی کاربر">
          <User className="h-5 w-5" />
          {!isMobile && <ChevronDown className="h-4 w-4" />}
          <span className="sr-only">منوی کاربر</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`w-48 ${isMobile ? 'w-56' : ''}`}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {isAdmin ? 'مدیر سیستم' : isContractor ? 'پیمانکار' : isCustomer ? 'مشتری' : 'کاربر'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Common items for all users */}
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>اطلاعات حساب کاربری</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/notifications">
            <Bell className="mr-2 h-4 w-4" />
            <span>اعلان ها</span>
            {unreadNotificationsCount > 0 && (
              <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/support">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>پشتیبانی</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>پیام‌ها</span>
          </Link>
        </DropdownMenuItem>
        
        {/* Role-specific items: customer-style dashboard & orders & quotes & cart */}
        {hasCustomerAccess && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/dashboard">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>داشبورد</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/orders">
                <Package className="mr-2 h-4 w-4" />
                <span>سفارشات من</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/quotes">
                <FileText className="mr-2 h-4 w-4" />
                <span>پیشنهادات دریافتی</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/cart">
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>سبد خرید</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        {isContractor && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/contractor-dashboard">
                <Briefcase className="mr-2 h-4 w-4" />
                <span>پنل پیمانکار</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/contractor/quotes">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>پیشنهادات</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/contractor/projects">
                <FileText className="mr-2 h-4 w-4" />
                <span>پروژه‌های فعال</span>
              </Link>
            </DropdownMenuItem>
            
            {(manufacturingCheck as { has_manufacturing_service?: boolean })?.has_manufacturing_service && (
              <DropdownMenuItem asChild>
                <Link to="/my-workshops">
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>کارگاه‌های من</span>
                </Link>
              </DropdownMenuItem>
            )}
          </>
        )}
        
        {/* Admin items */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/file-manager">
                <FolderOpen className="mr-2 h-4 w-4" />
                <span>مدیریت فایل‌ها</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/admin/" target="_blank">
                <Shield className="mr-2 h-4 w-4" />
                <span>پنل ادمین Django</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>خروج از حساب کاربری</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
