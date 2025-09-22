import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, CheckCircle, XCircle, Clock, DollarSign, Package, 
  Truck, Star, MessageCircle, Eye, Trash2, Filter,
  TrendingUp, Award, AlertCircle, Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_order?: {
    id: string;
    order_number: string;
  };
  related_quote?: {
    id: string;
    price: number;
  };
}

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/notifications/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        setError('خطا در دریافت اعلان‌ها');
      }
    } catch (error) {
      setError('خطای شبکه در دریافت اعلان‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/v1/notifications/${notificationId}/read/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/v1/notifications/read-all/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      'order_status': Package,
      'quote_received': DollarSign,
      'quote_accepted': CheckCircle,
      'payment_completed': CheckCircle,
      'order_completed': Award,
      'system': Info,
    };
    
    const IconComponent = iconMap[type as keyof typeof iconMap] || Bell;
    return <IconComponent className="h-5 w-5" />;
  };

  const getNotificationColor = (type: string) => {
    const colorMap = {
      'order_status': 'text-blue-600 bg-blue-100',
      'quote_received': 'text-green-600 bg-green-100',
      'quote_accepted': 'text-green-600 bg-green-100',
      'payment_completed': 'text-green-600 bg-green-100',
      'order_completed': 'text-purple-600 bg-purple-100',
      'system': 'text-gray-600 bg-gray-100',
    };
    
    return colorMap[type as keyof typeof colorMap] || 'text-gray-600 bg-gray-100';
  };

  const getTypeLabel = (type: string) => {
    const labelMap = {
      'order_status': 'وضعیت سفارش',
      'quote_received': 'دریافت پیشنهاد',
      'quote_accepted': 'تایید پیشنهاد',
      'payment_completed': 'تکمیل پرداخت',
      'order_completed': 'تکمیل سفارش',
      'system': 'سیستم',
    };
    
    return labelMap[type as keyof typeof labelMap] || 'سایر';
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return !notification.is_read;
      case 'quotes':
        return notification.type === 'quote_received' || notification.type === 'quote_accepted';
      case 'orders':
        return notification.type === 'order_status' || notification.type === 'order_completed';
      case 'payments':
        return notification.type === 'payment_completed';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const quotesCount = notifications.filter(n => n.type === 'quote_received' || n.type === 'quote_accepted').length;
  const ordersCount = notifications.filter(n => n.type === 'order_status' || n.type === 'order_completed').length;
  const paymentsCount = notifications.filter(n => n.type === 'payment_completed').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">اعلان‌ها</h1>
              <p className="text-gray-600">پیگیری آخرین رویدادها و اعلان‌ها</p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline">
                  <CheckCircle className="h-4 w-4 ml-2" />
                  علامت‌گذاری همه به عنوان خوانده شده
                </Button>
              )}
              <Button onClick={fetchNotifications} variant="outline">
                <Bell className="h-4 w-4 ml-2" />
                بروزرسانی
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">کل اعلان‌ها</p>
                    <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">خوانده نشده</p>
                    <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">پیشنهادات</p>
                    <p className="text-2xl font-bold text-gray-900">{quotesCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">سفارشات</p>
                    <p className="text-2xl font-bold text-gray-900">{ordersCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                همه ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                خوانده نشده ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="quotes" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                پیشنهادات ({quotesCount})
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                سفارشات ({ordersCount})
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                پرداخت‌ها ({paymentsCount})
              </TabsTrigger>
            </TabsList>

            {/* All Notifications Tab */}
            <TabsContent value="all" className="space-y-4">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`hover:shadow-md transition-shadow ${
                        !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {getTypeLabel(notification.type)}
                                </Badge>
                                {!notification.is_read && (
                                  <Badge variant="default" className="text-xs bg-blue-600">
                                    جدید
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(notification.created_at).toLocaleDateString('fa-IR')}
                              </div>
                            </div>
                            
                            <p className="text-gray-700 mb-3">{notification.message}</p>
                            
                            <div className="flex items-center gap-2">
                              {!notification.is_read && (
                                <Button
                                  onClick={() => markAsRead(notification.id)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <CheckCircle className="h-4 w-4 ml-2" />
                                  علامت‌گذاری به عنوان خوانده شده
                                </Button>
                              )}
                              
                              {notification.related_order && (
                                <Button asChild size="sm" variant="outline">
                                  <Link to={`/orders/${notification.related_order.id}`}>
                                    <Eye className="h-4 w-4 ml-2" />
                                    مشاهده سفارش
                                  </Link>
                                </Button>
                              )}
                              
                              {notification.related_quote && (
                                <Button size="sm" variant="outline">
                                  <DollarSign className="h-4 w-4 ml-2" />
                                  مشاهده پیشنهاد
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">اعلانی یافت نشد</h3>
                    <p className="text-gray-600">
                      {activeTab === 'all' 
                        ? 'هنوز اعلانی دریافت نکرده‌اید'
                        : `در دسته‌بندی ${activeTab} اعلانی یافت نشد`
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Other tabs have similar structure but filtered content */}
            <TabsContent value="unread" className="space-y-4">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className="border-l-4 border-l-blue-500 bg-blue-50 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                <Badge variant="default" className="text-xs bg-blue-600">
                                  جدید
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(notification.created_at).toLocaleDateString('fa-IR')}
                              </div>
                            </div>
                            
                            <p className="text-gray-700 mb-3">{notification.message}</p>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => markAsRead(notification.id)}
                                size="sm"
                                variant="outline"
                              >
                                <CheckCircle className="h-4 w-4 ml-2" />
                                علامت‌گذاری به عنوان خوانده شده
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">همه اعلان‌ها خوانده شده‌اند</h3>
                    <p className="text-gray-600">
                      اعلان خوانده نشده‌ای وجود ندارد
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Similar structure for other tabs... */}
            <TabsContent value="quotes" className="space-y-4">
              {/* Quote notifications content */}
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              {/* Order notifications content */}
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4">
              {/* Payment notifications content */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Notifications;