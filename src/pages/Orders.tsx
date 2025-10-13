import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, Filter, Eye, Download, MessageCircle, ShoppingCart, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAddOrderToCart, useAcceptQuote, useDownloadInvoice } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

interface Order {
  id: string;
  order_number: string;
  notes?: string;
  status: string;
  created_at: string;
  total_amount?: number;
  items?: unknown[];
}

function toOrderArray(input: unknown): Order[] {
  if (!Array.isArray(input)) return [];
  return input.filter((o): o is Order => {
    if (!o || typeof o !== 'object') return false;
    const obj = o as Record<string, unknown>;
    return typeof obj.id === 'string' && typeof obj.order_number === 'string' && typeof obj.status === 'string';
  });
}

const Orders = () => {
  const { orders, isLoadingDashboard } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Order management hooks
  const addToCartMutation = useAddOrderToCart();
  const acceptQuoteMutation = useAcceptQuote();
  const downloadInvoiceMutation = useDownloadInvoice();

  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
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
    );
  }

  const filteredOrders = toOrderArray(orders).filter((order) => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'draft': { label: 'پیش‌نویس', variant: 'secondary' as const },
      'submitted': { label: 'ارسال شده', variant: 'default' as const },
      'in_review': { label: 'در حال بررسی', variant: 'default' as const },
      'quoted': { label: 'قیمت‌گذاری شده', variant: 'default' as const },
      'accepted': { label: 'تایید شده', variant: 'default' as const },
      'in_progress': { label: 'در حال انجام', variant: 'default' as const },
      'completed': { label: 'تکمیل شده', variant: 'default' as const },
      'delivered': { label: 'تحویل داده شده', variant: 'default' as const },
      'cancelled': { label: 'لغو شده', variant: 'destructive' as const },
      'refunded': { label: 'بازگشت وجه', variant: 'destructive' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      'draft': 'text-gray-600',
      'submitted': 'text-blue-600',
      'in_review': 'text-yellow-600',
      'quoted': 'text-purple-600',
      'accepted': 'text-green-600',
      'in_progress': 'text-blue-600',
      'completed': 'text-green-600',
      'delivered': 'text-green-600',
      'cancelled': 'text-red-600',
      'refunded': 'text-red-600',
    };
    return colorMap[status as keyof typeof colorMap] || 'text-gray-600';
  };

  const handleAddToCart = async (orderId: string) => {
    try {
      await addToCartMutation.mutateAsync(orderId);
      // Show success message or redirect
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await acceptQuoteMutation.mutateAsync(quoteId);
      // Show success message
    } catch (error) {
      console.error('Error accepting quote:', error);
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
            <h1 className="text-3xl font-bold text-gray-900">سفارشات من</h1>
            <p className="text-gray-600">مدیریت و پیگیری سفارشات شما</p>
          </div>
          <Button asChild>
            <Link to="/services">
              <Package className="h-4 w-4 ml-2" />
              سفارش جدید
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
                    placeholder="جستجو در سفارشات..."
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
                    <SelectItem value="draft">پیش‌نویس</SelectItem>
                    <SelectItem value="submitted">ارسال شده</SelectItem>
                    <SelectItem value="in_review">در حال بررسی</SelectItem>
                    <SelectItem value="quoted">قیمت‌گذاری شده</SelectItem>
                    <SelectItem value="accepted">تایید شده</SelectItem>
                    <SelectItem value="in_progress">در حال انجام</SelectItem>
                    <SelectItem value="completed">تکمیل شده</SelectItem>
                    <SelectItem value="delivered">تحویل داده شده</SelectItem>
                    <SelectItem value="cancelled">لغو شده</SelectItem>
                    <SelectItem value="refunded">بازگشت وجه</SelectItem>
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
                          <p className={getStatusColor(order.status)}>
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
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4 ml-2" />
                          مشاهده جزئیات
                        </Link>
                      </Button>
                      
                      {/* Add to Cart - Only for quoted orders */}
                      {order.status === 'quoted' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddToCart(order.id)}
                          disabled={addToCartMutation.isPending}
                        >
                          <ShoppingCart className="h-4 w-4 ml-2" />
                          {addToCartMutation.isPending ? 'در حال اضافه کردن...' : 'اضافه به سبد خرید'}
                        </Button>
                      )}
                      
                      {/* Accept Quote - Only for quoted orders */}
                      {order.status === 'quoted' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleAcceptQuote(order.id)}
                          disabled={acceptQuoteMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 ml-2" />
                          {acceptQuoteMutation.isPending ? 'در حال تایید...' : 'تایید پیشنهاد'}
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
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">سفارشی یافت نشد</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'با فیلترهای انتخابی سفارشی یافت نشد'
                  : 'هنوز سفارشی ثبت نکرده‌اید'
                }
              </p>
              <Button asChild>
                <Link to="/services">سفارش جدید</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
