import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, Clock, CheckCircle, XCircle, User, 
  Package, Star, MessageCircle, Eye, AlertCircle,
  TrendingUp, Award, Calendar, Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAcceptQuote, useRejectQuote } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import QuoteManager from '@/components/QuoteManager';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  notes: string;
  created_at: string;
  items: Array<{
    id: string;
    service: {
      name: string;
      type: string;
    };
    quotes: Array<{
      id: string;
      contractor: {
        username: string;
        profile_image?: string;
      };
      price: number;
      documentation_price: number;
      delivery_days: number;
      documentation_days: number;
      notes: string;
      status: string;
      created_at: string;
    }>;
  }>;
}

const CustomerQuotes = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [error, setError] = useState<string | null>(null);
  
  // Quote management hooks
  const acceptQuoteMutation = useAcceptQuote();
  const rejectQuoteMutation = useRejectQuote();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1/orders/user/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('خطا در دریافت سفارشات');
      }
    } catch (error) {
      setError('خطای شبکه در دریافت سفارشات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await acceptQuoteMutation.mutateAsync(quoteId);
      // Data will be automatically refreshed by the mutation
    } catch (error) {
      setError('خطا در تایید پیشنهاد');
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    try {
      await rejectQuoteMutation.mutateAsync(quoteId);
      // Data will be automatically refreshed by the mutation
    } catch (error) {
      setError('خطا در رد پیشنهاد');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'submitted': { label: 'ارسال شده', variant: 'default' as const, icon: Clock },
      'in_review': { label: 'در حال بررسی', variant: 'secondary' as const, icon: Eye },
      'quoted': { label: 'قیمت‌گذاری شده', variant: 'default' as const, icon: DollarSign },
      'accepted': { label: 'تایید شده', variant: 'default' as const, icon: CheckCircle },
      'in_progress': { label: 'در حال انجام', variant: 'default' as const, icon: Package },
      'completed': { label: 'تکمیل شده', variant: 'default' as const, icon: Award },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: AlertCircle 
    };
    
    const IconComponent = statusInfo.icon;
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  // Filter orders by quote status
  const ordersWithPendingQuotes = orders.filter(order => 
    order.items.some(item => 
      item.quotes.some(quote => quote.status === 'pending')
    )
  );

  const ordersWithAcceptedQuotes = orders.filter(order => 
    order.items.some(item => 
      item.quotes.some(quote => quote.status === 'accepted')
    )
  );

  const ordersWithRejectedQuotes = orders.filter(order => 
    order.items.some(item => 
      item.quotes.some(quote => quote.status === 'rejected')
    )
  );

  const getOrderQuotes = (order: Order) => {
    const allQuotes = order.items.flatMap(item => 
      item.quotes.map(quote => ({
        ...quote,
        order_item: {
          id: item.id,
          service: item.service
        }
      }))
    );
    return allQuotes;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto space-y-6">
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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مدیریت پیشنهادات</h1>
              <p className="text-gray-600">بررسی و تایید پیشنهادات پیمانکاران</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/orders">
                  <Package className="h-4 w-4 ml-2" />
                  سفارشات من
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/notifications">
                  <MessageCircle className="h-4 w-4 ml-2" />
                  اعلان‌ها
                </Link>
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">در انتظار بررسی</p>
                    <p className="text-2xl font-bold text-gray-900">{ordersWithPendingQuotes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تایید شده</p>
                    <p className="text-2xl font-bold text-gray-900">{ordersWithAcceptedQuotes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">رد شده</p>
                    <p className="text-2xl font-bold text-gray-900">{ordersWithRejectedQuotes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">کل سفارشات</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                در انتظار بررسی ({ordersWithPendingQuotes.length})
              </TabsTrigger>
              <TabsTrigger value="accepted" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                تایید شده ({ordersWithAcceptedQuotes.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                رد شده ({ordersWithRejectedQuotes.length})
              </TabsTrigger>
            </TabsList>

            {/* Pending Quotes Tab */}
            <TabsContent value="pending" className="space-y-6">
              {ordersWithPendingQuotes.length > 0 ? (
                ordersWithPendingQuotes.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/orders/${order.id}`}>
                              <Eye className="h-4 w-4 ml-2" />
                              مشاهده جزئیات
                            </Link>
                          </Button>
                          <div className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('fa-IR')}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">پیشنهادات دریافتی:</h4>
                        <QuoteManager
                          quotes={getOrderQuotes(order).filter(quote => quote.status === 'pending')}
                          onAcceptQuote={handleAcceptQuote}
                          onRejectQuote={handleRejectQuote}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">پیشنهادی در انتظار بررسی نیست</h3>
                    <p className="text-gray-600">
                      در حال حاضر پیشنهادی برای بررسی وجود ندارد
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Accepted Quotes Tab */}
            <TabsContent value="accepted" className="space-y-6">
              {ordersWithAcceptedQuotes.length > 0 ? (
                ordersWithAcceptedQuotes.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/orders/${order.id}`}>
                              <Eye className="h-4 w-4 ml-2" />
                              مشاهده جزئیات
                            </Link>
                          </Button>
                          <div className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('fa-IR')}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">پیشنهادات تایید شده:</h4>
                        <QuoteManager
                          quotes={getOrderQuotes(order).filter(quote => quote.status === 'accepted')}
                          onAcceptQuote={handleAcceptQuote}
                          onRejectQuote={handleRejectQuote}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">پیشنهاد تایید شده‌ای یافت نشد</h3>
                    <p className="text-gray-600">
                      هنوز پیشنهادی تایید نکرده‌اید
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Rejected Quotes Tab */}
            <TabsContent value="rejected" className="space-y-6">
              {ordersWithRejectedQuotes.length > 0 ? (
                ordersWithRejectedQuotes.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('fa-IR')}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">پیشنهادات رد شده:</h4>
                        <QuoteManager
                          quotes={getOrderQuotes(order).filter(quote => quote.status === 'rejected')}
                          onAcceptQuote={handleAcceptQuote}
                          onRejectQuote={handleRejectQuote}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <XCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">پیشنهاد رد شده‌ای یافت نشد</h3>
                    <p className="text-gray-600">
                      هنوز پیشنهادی رد نکرده‌اید
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomerQuotes;
