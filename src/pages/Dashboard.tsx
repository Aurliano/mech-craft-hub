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
      <div className="bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">داشبورد</h1>
              <p className="text-gray-600">خوش آمدید، {user?.username}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link to="/design">
                  <Plus className="h-4 w-4 ml-2" />
                  سفارش جدید
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">کل سفارشات</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">در انتظار</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats?.pendingOrders || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">تکمیل شده</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.completedOrders || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">سبد خرید</p>
                    <p className="text-2xl font-bold text-purple-600">{cartItems?.length || 0}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/cart">مشاهده سبد خرید</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        سفارشات اخیر
                      </CardTitle>
                      <CardDescription>آخرین سفارشات شما</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/orders">مشاهده همه</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{order.order_number}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                              {order.status === 'completed' ? 'تکمیل شده' : 
                               order.status === 'in_progress' ? 'در حال انجام' :
                               order.status === 'pending' ? 'در انتظار' : order.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        اعلان‌ها
                      </CardTitle>
                      <CardDescription>آخرین اعلان‌های شما</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/notifications">مشاهده همه</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentNotifications.length > 0 ? (
                    <div className="space-y-3">
                      {recentNotifications.map((notification) => (
                        <div key={notification.id} className={`p-3 rounded-lg border-r-4 ${
                          notification.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-500'
                        }`}>
                          <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
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