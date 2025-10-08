import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, Clock, DollarSign, User, Calendar, FileText, 
  Eye, MessageCircle, Download, CheckCircle, XCircle, 
  AlertCircle, Star, Truck, Award, Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGetOrderById, useGetQuotesByOrder } from '@/hooks/useAuth';
import { Link, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';

interface OrderItem {
  id: string;
  service: {
    id: string;
    name: string;
    description: string;
  };
  field_values: Record<string, any>;
  needs_documentation: boolean;
  status: string;
  price?: number;
  estimated_delivery?: string;
  assigned_contractor?: {
    id: string;
    username: string;
    profile_image?: string;
  };
}

interface Quote {
  id: string;
  contractor: {
    id: string;
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
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  notes: string;
  documentation_options: Record<string, boolean>;
  total_amount: number;
  created_at: string;
  customer: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  items: OrderItem[];
}

const OrderDetails = () => {
  const { user } = useAuth();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  // API Hooks
  const { data: orderData, isLoading: isLoadingOrder } = useGetOrderById(orderId);
  const { data: quotesData, isLoading: isLoadingQuotes } = useGetQuotesByOrder(orderId);

  useEffect(() => {
    if (orderData) {
      setOrder(orderData);
    }
  }, [orderData]);

  useEffect(() => {
    if (quotesData) {
      setQuotes(quotesData);
    }
  }, [quotesData]);

  useEffect(() => {
    setIsLoading(isLoadingOrder || isLoadingQuotes);
  }, [isLoadingOrder, isLoadingQuotes]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'submitted': { label: 'ارسال شده', variant: 'default' as const, icon: Clock },
      'quoted': { label: 'پیشنهاد دریافت شده', variant: 'secondary' as const, icon: MessageCircle },
      'accepted': { label: 'تایید شده', variant: 'default' as const, icon: CheckCircle },
      'in_progress': { label: 'در حال انجام', variant: 'secondary' as const, icon: Package },
      'delivered': { label: 'تحویل داده شده', variant: 'default' as const, icon: Truck },
      'completed': { label: 'تکمیل شده', variant: 'default' as const, icon: Award },
      'cancelled': { label: 'لغو شده', variant: 'destructive' as const, icon: XCircle },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.submitted;
    const Icon = statusInfo.icon;

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getItemStatusBadge = (status: string) => {
    const statusMap = {
      'submitted': { label: 'ارسال شده', variant: 'default' as const, icon: Clock },
      'quoted': { label: 'پیشنهاد دریافت شده', variant: 'secondary' as const, icon: MessageCircle },
      'accepted': { label: 'تایید شده', variant: 'default' as const, icon: CheckCircle },
      'in_progress': { label: 'در حال انجام', variant: 'secondary' as const, icon: Package },
      'delivered': { label: 'تحویل داده شده', variant: 'default' as const, icon: Truck },
      'completed': { label: 'تکمیل شده', variant: 'default' as const, icon: Award },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.submitted;
    const Icon = statusInfo.icon;

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) return 'تعریف نشده';
    if (typeof value === 'boolean') return value ? 'بله' : 'خیر';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const renderFieldValues = (fieldValues: Record<string, any>) => {
    return Object.entries(fieldValues).map(([key, value]) => (
      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <span className="font-medium text-gray-700">{key}:</span>
        <span className="text-gray-900">{formatFieldValue(value)}</span>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'سفارش یافت نشد'}
              </AlertDescription>
            </Alert>
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
              <h1 className="text-3xl font-bold text-gray-900">جزئیات سفارش</h1>
              <p className="text-gray-600">شماره سفارش: {order.order_number}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/orders">
                  <Eye className="h-4 w-4 ml-2" />
                  بازگشت به سفارشات
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/support">
                  <MessageCircle className="h-4 w-4 ml-2" />
                  پشتیبانی
                </Link>
              </Button>
            </div>
          </div>

          {/* Order Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>وضعیت سفارش</CardTitle>
                    <CardDescription>اطلاعات کلی سفارش</CardDescription>
                  </div>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تاریخ ایجاد</p>
                    <p className="font-semibold">{new Date(order.created_at).toLocaleDateString('fa-IR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">مبلغ کل</p>
                    <p className="font-semibold">{order.total_amount?.toLocaleString('fa-IR') || 'تعریف نشده'} تومان</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">مشتری</p>
                    <p className="font-semibold">{order.customer.first_name} {order.customer.last_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Package className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تعداد آیتم</p>
                    <p className="font-semibold">{order.items.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                جزئیات سفارش
              </TabsTrigger>
              <TabsTrigger value="quotes" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                پیشنهادات ({quotes.length})
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                یادداشت‌ها
              </TabsTrigger>
            </TabsList>

            {/* Order Details Tab */}
            <TabsContent value="details" className="space-y-6">
              {order.items.map((item, index) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle>آیتم {index + 1}: {item.service.name}</CardTitle>
                          <CardDescription>{item.service.description}</CardDescription>
                        </div>
                      </div>
                      {getItemStatusBadge(item.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Service Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        جزئیات سرویس
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">نام سرویس:</p>
                            <p className="font-medium">{item.service.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">توضیحات:</p>
                            <p className="font-medium">{item.service.description}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">نیاز به مستندات:</p>
                            <Badge variant={item.needs_documentation ? 'default' : 'secondary'}>
                              {item.needs_documentation ? 'بله' : 'خیر'}
                            </Badge>
                          </div>
                          {item.price && (
                            <div>
                              <p className="text-sm text-gray-600">قیمت:</p>
                              <p className="font-medium">{item.price.toLocaleString('fa-IR')} تومان</p>
                            </div>
                          )}
                          {item.estimated_delivery && (
                            <div>
                              <p className="text-sm text-gray-600">تاریخ تحویل پیشنهادی:</p>
                              <p className="font-medium">{new Date(item.estimated_delivery).toLocaleDateString('fa-IR')}</p>
                            </div>
                          )}
                          {item.assigned_contractor && (
                            <div>
                              <p className="text-sm text-gray-600">پیمانکار:</p>
                              <p className="font-medium">{item.assigned_contractor.username}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Field Values */}
                    {Object.keys(item.field_values).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          فیلدهای پر شده
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {renderFieldValues(item.field_values)}
                        </div>
                      </div>
                    )}

                    {/* Documentation Options */}
                    {item.needs_documentation && Object.keys(order.documentation_options).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          گزینه‌های مستندات
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {Object.entries(order.documentation_options).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <span className="font-medium text-gray-700">{key}:</span>
                              <Badge variant={value ? 'default' : 'secondary'}>
                                {value ? 'بله' : 'خیر'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Quotes Tab */}
            <TabsContent value="quotes" className="space-y-4">
              {quotes.length > 0 ? (
                quotes.map((quote) => (
                  <Card key={quote.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {quote.contractor.profile_image ? (
                              <img 
                                src={quote.contractor.profile_image} 
                                alt={quote.contractor.username}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <User className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <CardTitle>{quote.contractor.username}</CardTitle>
                            <CardDescription>
                              {new Date(quote.created_at).toLocaleDateString('fa-IR')}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={quote.status === 'accepted' ? 'default' : 'secondary'}>
                          {quote.status === 'accepted' ? 'تایید شده' : 'در انتظار بررسی'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">قیمت پروژه:</p>
                          <p className="font-semibold">{quote.price.toLocaleString('fa-IR')} تومان</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">قیمت مستندات:</p>
                          <p className="font-semibold">{quote.documentation_price.toLocaleString('fa-IR')} تومان</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">زمان تحویل:</p>
                          <p className="font-semibold">{quote.delivery_days} روز</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">زمان مستندات:</p>
                          <p className="font-semibold">{quote.documentation_days} روز</p>
                        </div>
                      </div>
                      {quote.notes && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">یادداشت پیمانکار:</p>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-700">{quote.notes}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">پیشنهادی یافت نشد</h3>
                    <p className="text-gray-600">
                      هنوز پیشنهادی برای این سفارش دریافت نشده است
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>یادداشت‌های سفارش</CardTitle>
                  <CardDescription>اطلاعات اضافی و یادداشت‌های مربوط به سفارش</CardDescription>
                </CardHeader>
                <CardContent>
                  {order.notes ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">یادداشتی برای این سفارش ثبت نشده است</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
