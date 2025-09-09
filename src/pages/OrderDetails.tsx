import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Clock, DollarSign, FileText, User } from 'lucide-react';
import { useGetOrderById, useGetQuotesByOrder, useAcceptQuote } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import QuoteCard from '@/components/QuoteCard';

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading: isLoadingOrder } = useGetOrderById(orderId || '');
  const { data: quotes, isLoading: isLoadingQuotes } = useGetQuotesByOrder(orderId || '');
  const acceptQuoteMutation = useAcceptQuote();

  if (isLoadingOrder) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">سفارش یافت نشد</h1>
            <Button asChild>
              <Link to="/orders">بازگشت به سفارشات</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await acceptQuoteMutation.mutateAsync(quoteId);
    } catch (error) {
      console.error('Error accepting quote:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders">
                <ArrowLeft className="h-4 w-4 ml-2" />
                بازگشت
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">جزئیات سفارش</h1>
              <p className="text-gray-600">شماره سفارش: {order.order_number}</p>
            </div>
          </div>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  اطلاعات سفارش
                </CardTitle>
                <OrderStatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">تاریخ ایجاد</p>
                    <p className="font-medium">{new Date(order.created_at).toLocaleDateString('fa-IR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">مبلغ کل</p>
                    <p className="font-medium">
                      {order.total_amount ? `${order.total_amount.toLocaleString()} تومان` : 'در انتظار قیمت‌گذاری'}
                    </p>
                  </div>
                </div>
              </div>
              
              {order.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">یادداشت:</p>
                  <p className="text-gray-700">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>آیتم‌های سفارش</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{item.service?.name || 'سرویس'}</h4>
                      <OrderStatusBadge status={item.status} />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>قیمت: {item.price ? `${item.price.toLocaleString()} تومان` : 'در انتظار قیمت‌گذاری'}</p>
                      {item.needs_documentation && (
                        <p className="text-blue-600">نیاز به مستندسازی</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quotes Section */}
          {quotes && quotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>پیشنهادات دریافتی</CardTitle>
                <CardDescription>
                  {quotes.length} پیشنهاد دریافت شده است
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quotes.map((quote: any) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      onAccept={handleAcceptQuote}
                      isAccepting={acceptQuoteMutation.isPending}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Quotes Message */}
          {quotes && quotes.length === 0 && order.status === 'pending' && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">هنوز پیشنهادی دریافت نشده</h3>
                <p className="text-gray-600">پیمانکاران در حال بررسی سفارش شما هستند</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
