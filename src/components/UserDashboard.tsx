import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, Bell, TrendingUp, Clock, CheckCircle, User, BarChart3, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user, orders, cartItems, notifications, stats, isLoadingDashboard, logout } = useAuth();
  const unreadNotificationsCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;
  const cartItemsCount = cartItems?.length || 0;

  if (isLoadingDashboard) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-primary">
          خوش آمدید، {user?.username}!
        </h2>
        <p className="text-muted-foreground mt-2">
          از داشبورد خود برای مدیریت سفارشات و سبد خرید استفاده کنید
        </p>
      </div>

      {/* Dashboard Navigation Menu */}
      <Card>
        <CardHeader>
          <CardTitle>منوی داشبورد</CardTitle>
          <CardDescription>دسترسی سریع به بخش‌های مختلف</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. اطلاعات حساب کاربری */}
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" asChild>
              <Link to="/profile">
                <User className="h-6 w-6" />
                <span>اطلاعات حساب کاربری</span>
              </Link>
            </Button>

            {/* 2. داشبورد */}
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" asChild>
              <Link to="/dashboard">
                <BarChart3 className="h-6 w-6" />
                <span>داشبورد</span>
              </Link>
            </Button>

            {/* 3. اعلان ها */}
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 relative" asChild>
              <Link to="/notifications">
                <Bell className="h-6 w-6" />
                <span>اعلان ها</span>
                {unreadNotificationsCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadNotificationsCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* 4. سفارشات */}
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" asChild>
              <Link to="/orders">
                <Package className="h-6 w-6" />
                <span>سفارشات</span>
              </Link>
            </Button>

            {/* 5. پشتیبانی */}
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" asChild>
              <Link to="/support">
                <HelpCircle className="h-6 w-6" />
                <span>پشتیبانی</span>
              </Link>
            </Button>

            {/* 6. خروج از حساب */}
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="h-6 w-6" />
              <span>خروج از حساب</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Separate Cart Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            سبد خرید
            {cartItemsCount > 0 && (
              <Badge variant="secondary">{cartItemsCount} آیتم</Badge>
            )}
          </CardTitle>
          <CardDescription>آیتم‌های انتخاب شده برای خرید</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{cartItemsCount}</p>
              <p className="text-sm text-muted-foreground">آیتم در سبد خرید</p>
            </div>
            <Button asChild>
              <Link to="/cart">
                مشاهده سبد خرید
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل سفارشات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 از ماه گذشته
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سفارشات در انتظار</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              در حال پردازش
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سفارشات تکمیل شده</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              با موفقیت تحویل داده شده
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آیتم‌های سبد خرید</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cartItems?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              آماده برای سفارش
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>سفارشات اخیر</CardTitle>
          <CardDescription>
            آخرین سفارشات شما
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">سفارش #{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      order.status === 'completed' ? 'default' :
                      order.status === 'pending' ? 'secondary' : 'outline'
                    }>
                      {order.status === 'completed' ? 'تکمیل شده' :
                       order.status === 'pending' ? 'در انتظار' : order.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      {order.total_amount ? `${order.total_amount} تومان` : 'قیمت نامشخص'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هنوز سفارشی ثبت نکرده‌اید</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            نوتیفیکیشن‌ها
            {unreadNotificationsCount > 0 && (
              <Badge variant="destructive">{unreadNotificationsCount}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            آخرین اطلاعیه‌ها و اعلان‌ها
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications && notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification: any) => (
                <div key={notification.id} className={`p-3 rounded-lg border ${
                  !notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هیچ نوتیفیکیشنی ندارید</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
