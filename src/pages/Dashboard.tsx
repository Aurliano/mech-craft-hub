import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, Bell, Clock, CheckCircle, Plus, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Dashboard = () => {
  const { user, orders, cartItems, notifications, stats, isLoadingDashboard } = useAuth();

  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen" dir="rtl">
        <Navbar />
        <div className="bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
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
        </div>
      </div>
    );
  }

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];
  const recentNotifications = Array.isArray(notifications) ? notifications.slice(0, 5) : [];

  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      <div className="bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">داشبورد</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                خوش آمدید، {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="w-full sm:w-auto">
                <Link to="/design">
                  <Plus className="h-4 w-4 ml-2" />
                  سفارش جدید
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">کل سفارشات</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{(stats as { totalOrders?: number })?.totalOrders || 0}</p>
                  </div>
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">در انتظار</p>
                    <p className="text-lg sm:text-2xl font-bold text-yellow-600">{(stats as { pendingOrders?: number })?.pendingOrders || 0}</p>
                  </div>
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">تکمیل شده</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">{(stats as { completedOrders?: number })?.completedOrders || 0}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-0">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">سبد خرید</p>
                    <p className="text-lg sm:text-2xl font-bold text-purple-600">{cartItems?.length || 0}</p>
                  </div>
                  <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <div className="mt-3 sm:mt-4">
                  <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm" asChild>
                    <Link to="/cart">مشاهده سبد خرید</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                        سفارشات اخیر
                      </CardTitle>
                      <CardDescription className="text-sm">آخرین سفارشات شما</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
                      <Link to="/orders">مشاهده همه</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order: { id: string; order_number: string; created_at: string; status: string }) => (
                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">{order.order_number}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                              {order.status === 'completed' ? 'تکمیل شده' : 
                               order.status === 'in_progress' ? 'در حال انجام' :
                               order.status === 'pending' ? 'در انتظار' : order.status}
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>هنوز سفارشی ثبت نکرده‌اید</p>
                      <Button asChild className="mt-4">
                        <Link to="/design">سفارش جدید</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notifications */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                        اعلان‌ها
                      </CardTitle>
                      <CardDescription className="text-sm">آخرین اعلان‌های شما</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
                      <Link to="/notifications">مشاهده همه</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentNotifications.length > 0 ? (
                    <div className="space-y-3">
                      {recentNotifications.map((notification: { id: string; title: string; message: string; createdAt: string; isRead?: boolean }) => (
                        <div key={notification.id} className={`p-2 sm:p-3 rounded-lg border-r-4 ${
                          notification.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-500'
                        }`}>
                          <h4 className="font-medium text-xs sm:text-sm text-gray-900">{notification.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>اعلان جدیدی ندارید</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;