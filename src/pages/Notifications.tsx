import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Search, Filter, Check, X, Package, CreditCard, MessageCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

const Notifications = () => {
  const { notifications, isLoadingDashboard } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
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
    );
  }

  const filteredNotifications = notifications?.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && notification.isRead) ||
                         (statusFilter === 'unread' && !notification.isRead);
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      'order': Package,
      'payment': CreditCard,
      'message': MessageCircle,
      'alert': AlertCircle,
      'info': Info,
    };
    const IconComponent = iconMap[type as keyof typeof iconMap] || Bell;
    return <IconComponent className="h-5 w-5" />;
  };

  const getNotificationColor = (type: string) => {
    const colorMap = {
      'order': 'text-blue-600',
      'payment': 'text-green-600',
      'message': 'text-purple-600',
      'alert': 'text-red-600',
      'info': 'text-gray-600',
    };
    return colorMap[type as keyof typeof colorMap] || 'text-gray-600';
  };

  const markAsRead = (notificationId: string) => {
    // TODO: Implement mark as read
    console.log('Mark as read:', notificationId);
  };

  const markAllAsRead = () => {
    // TODO: Implement mark all as read
    console.log('Mark all as read');
  };

  const deleteNotification = (notificationId: string) => {
    // TODO: Implement delete notification
    console.log('Delete notification:', notificationId);
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">اعلان‌ها</h1>
            <p className="text-gray-600">مدیریت اعلان‌ها و پیام‌های شما</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 ml-2" />
              همه را خوانده شده علامت‌گذاری کن
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">کل اعلان‌ها</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications?.length || 0}</p>
                </div>
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">خوانده نشده</p>
                  <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">خوانده شده</p>
                  <p className="text-2xl font-bold text-green-600">{(notifications?.length || 0) - unreadCount}</p>
                </div>
                <Check className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="جستجو در اعلان‌ها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="نوع اعلان" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه انواع</SelectItem>
                    <SelectItem value="order">سفارش</SelectItem>
                    <SelectItem value="payment">پرداخت</SelectItem>
                    <SelectItem value="message">پیام</SelectItem>
                    <SelectItem value="alert">هشدار</SelectItem>
                    <SelectItem value="info">اطلاعیه</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="unread">خوانده نشده</SelectItem>
                    <SelectItem value="read">خوانده شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`hover:shadow-md transition-shadow ${
                  !notification.isRead ? 'border-r-4 border-r-blue-500 bg-blue-50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <div className={getNotificationColor(notification.type)}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-semibold ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {notification.type === 'order' ? 'سفارش' :
                               notification.type === 'payment' ? 'پرداخت' :
                               notification.type === 'message' ? 'پیام' :
                               notification.type === 'alert' ? 'هشدار' :
                               notification.type === 'info' ? 'اطلاعیه' : notification.type}
                            </Badge>
                            {!notification.isRead && (
                              <Badge variant="default" className="text-xs">
                                جدید
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
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
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'با فیلترهای انتخابی اعلانی یافت نشد'
                  : 'هنوز اعلانی دریافت نکرده‌اید'
                }
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
