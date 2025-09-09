import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Search, Eye, Download, MessageCircle, CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProcessPayment, useDownloadInvoice } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Cart = () => {
  const { orders, isLoadingDashboard } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('quoted'); // فقط سفارشات قیمت‌گذاری شده
  
  // Payment hooks
  const processPaymentMutation = useProcessPayment();
  const downloadInvoiceMutation = useDownloadInvoice();

  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
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

  // فیلتر کردن سفارشات تایید شده توسط پیمانکاران
  const confirmedOrders = Array.isArray(orders) ? orders.filter(order => 
    order.status === 'quoted' || order.status === 'accepted'
  ) : [];

  const filteredOrders = confirmedOrders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'quoted': { label: 'قیمت‌گذاری شده', variant: 'default' as const },
      'accepted': { label: 'تایید شده', variant: 'default' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const calculateTotal = () => {
    return filteredOrders.reduce((total, order) => {
      return total + (order.total_amount || 0);
    }, 0);
  };

  const totalItems = filteredOrders.length;
  const totalAmount = calculateTotal();

  const handleProcessPayment = async (orderId: string, amount: number) => {
    try {
      await processPaymentMutation.mutateAsync({
        orderId,
        paymentData: {
          amount,
          method: 'online',
          gateway_response: { status: 'success' } // Mock response
        }
      });
      // Redirect to orders page after successful payment
      window.location.href = '/orders';
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      await downloadInvoiceMutation.mutateAsync(orderId);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">سبد خرید</h1>
            <p className="text-gray-600">سفارشات تایید شده توسط پیمانکاران</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/orders">
              <Eye className="h-4 w-4 ml-2" />
              مشاهده همه سفارشات
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="جستجو در سفارشات تایید شده..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="فیلتر وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="quoted">قیمت‌گذاری شده</SelectItem>
                    <SelectItem value="accepted">تایید شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">تاریخ سفارش:</span>
                          <p>{new Date(order.created_at).toLocaleDateString('fa-IR')}</p>
                        </div>
                        <div>
                          <span className="font-medium">مبلغ کل:</span>
                          <p className="text-green-600 font-semibold">
                            {order.total_amount ? `${order.total_amount.toLocaleString()} تومان` : 'در انتظار قیمت‌گذاری'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">تعداد آیتم‌ها:</span>
                          <p>{order.items?.length || 0} آیتم</p>
                        </div>
                      </div>
                      {order.notes && (
                        <div className="mt-3">
                          <span className="font-medium text-sm text-gray-600">یادداشت:</span>
                          <p className="text-sm text-gray-700 mt-1">{order.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 ml-2" />
                        مشاهده جزئیات
                      </Button>
                      {/* Payment Button - Only for quoted orders */}
                      {order.status === 'quoted' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleProcessPayment(order.id, order.total_amount || 0)}
                          disabled={processPaymentMutation.isPending}
                        >
                          <CreditCard className="h-4 w-4 ml-2" />
                          {processPaymentMutation.isPending ? 'در حال پردازش...' : 'پرداخت'}
                        </Button>
                      )}
                      
                      {/* Download Invoice - Only for completed orders */}
                      {order.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(order.id)}
                          disabled={downloadInvoiceMutation.isPending}
                        >
                          <Download className="h-4 w-4 ml-2" />
                          {downloadInvoiceMutation.isPending ? 'در حال دانلود...' : 'دانلود فاکتور'}
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 ml-2" />
                        پشتیبانی
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">سفارش تایید شده‌ای یافت نشد</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'با فیلترهای انتخابی سفارش تایید شده‌ای یافت نشد'
                  : 'هنوز سفارش تایید شده‌ای توسط پیمانکاران دریافت نکرده‌اید'
                }
              </p>
              <Button asChild>
                <Link to="/orders">مشاهده همه سفارشات</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Card */}
        {filteredOrders.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">خلاصه سفارشات تایید شده</h3>
                    <p className="text-sm text-green-700">سفارشات آماده برای پرداخت</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-900">
                    {totalAmount.toLocaleString()} تومان
                  </div>
                  <div className="text-sm text-green-700">
                    {totalItems} سفارش تایید شده
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    // Process payment for all quoted orders
                    filteredOrders.forEach(order => {
                      if (order.status === 'quoted') {
                        handleProcessPayment(order.id, order.total_amount || 0);
                      }
                    });
                  }}
                  disabled={processPaymentMutation.isPending}
                >
                  <CreditCard className="h-4 w-4 ml-2" />
                  {processPaymentMutation.isPending ? 'در حال پردازش...' : 'پرداخت همه سفارشات'}
                </Button>
                <Button 
                  variant="outline" 
                  className="border-green-300 text-green-700 hover:bg-green-100"
                  onClick={() => {
                    // Download invoices for all completed orders
                    filteredOrders.forEach(order => {
                      if (order.status === 'completed') {
                        handleDownloadInvoice(order.id);
                      }
                    });
                  }}
                  disabled={downloadInvoiceMutation.isPending}
                >
                  <Download className="h-4 w-4 ml-2" />
                  {downloadInvoiceMutation.isPending ? 'در حال دانلود...' : 'دانلود فاکتورها'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
};

export default Cart;