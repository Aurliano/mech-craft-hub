import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingCart, Search, Eye, Download, MessageCircle, CreditCard, CheckCircle, 
  Clock, Package, Star, AlertCircle, CheckCircle2, XCircle, Plus, Minus,
  ShoppingBag, Receipt, Truck, Award, Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProcessPayment, useDownloadInvoice } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { OrderPaymentPhases } from '@/components/OrderPaymentPhases';
import { formatPriceNumber } from '@/lib/priceUtils';

interface Order {
  status: string;
  order_number: string;
  notes?: string;
  total_amount?: number;
  // بقیه خواص در صورت نیاز اضافه شود
}

const Cart = () => {
  const { orders, isLoadingDashboard } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('quoted');
  const [cartItems, setCartItems] = useState([]);
  const [quotedOrdersList, setQuotedOrdersList] = useState([]);
  const [paymentStep, setPaymentStep] = useState('review'); // review, payment, confirmation
  const [selectedOrders, setSelectedOrders] = useState([]);
  
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

  // فیلتر کردن سفارشات بر اساس وضعیت
  const allOrders: Order[] = Array.isArray(orders) ? orders as Order[] : [];
  
  const quotedOrders = allOrders.filter(order =>
    order.status === 'quoted' || order.status === 'proposal_accepted'
  );
  const acceptedOrders = allOrders.filter(order => order.status === 'accepted');
  const inProgressOrders = allOrders.filter(order =>
    ['in_progress', 'project_paid'].includes(order.status)
  );
  const completedOrders = allOrders.filter(order => order.status === 'completed');

  const getFilteredOrders = (orderList) => {
    return orderList.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  };

  const filteredQuotedOrders = getFilteredOrders(quotedOrders);
  const filteredAcceptedOrders = getFilteredOrders(acceptedOrders);
  const filteredInProgressOrders = getFilteredOrders(inProgressOrders);
  const filteredCompletedOrders = getFilteredOrders(completedOrders);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'quoted': { label: 'قیمت‌گذاری شده', variant: 'default' as const, icon: Clock },
      'proposal_accepted': { label: 'پیشنهاد پذیرفته شده', variant: 'default' as const, icon: CheckCircle2 },
      'accepted': { label: 'تایید شده', variant: 'secondary' as const, icon: CheckCircle2 },
      'in_progress': { label: 'در حال انجام', variant: 'default' as const, icon: Package },
      'completed': { label: 'تکمیل شده', variant: 'default' as const, icon: CheckCircle },
      'delivered': { label: 'تحویل داده شده', variant: 'default' as const, icon: Truck },
      'cancelled': { label: 'لغو شده', variant: 'destructive' as const, icon: XCircle },
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

  const calculateTotal = (orderList) => {
    return orderList.reduce((total, order) => {
      return total + (order.total_amount || 0);
    }, 0);
  };

  const calculateDepositAmount = (totalAmount) => {
    return Math.round(totalAmount * 0.5); // 50% بیعانه
  };

  const calculateRemainingAmount = (totalAmount) => {
    return Math.round(totalAmount * 0.5); // 50% باقی‌مانده
  };

  // محاسبات برای هر تب
  const quotedTotal = calculateTotal(filteredQuotedOrders);
  const acceptedTotal = calculateTotal(filteredAcceptedOrders);
  const inProgressTotal = calculateTotal(filteredInProgressOrders);
  const completedTotal = calculateTotal(filteredCompletedOrders);

  const quotedDeposit = calculateDepositAmount(quotedTotal);
  const acceptedDeposit = calculateDepositAmount(acceptedTotal);

  const handleProcessPayment = async (orderId: string, amount: number, paymentType: 'deposit' | 'final' = 'deposit') => {
    try {
      await processPaymentMutation.mutateAsync({
        orderId,
        paymentData: {
          amount,
          method: 'online',
          payment_type: paymentType,
          gateway_response: { status: 'success' } // Mock response
        }
      });
      
      // Update order status based on payment type
      if (paymentType === 'deposit') {
        // Update to in_progress after deposit payment
        console.log('Deposit payment successful, order moved to in_progress');
      } else {
        // Update to completed after final payment
        console.log('Final payment successful, order completed');
      }
      
      // Refresh orders data
      window.location.reload();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleBulkPayment = async (orderIds: string[], totalAmount: number, paymentType: 'deposit' | 'final' = 'deposit') => {
    try {
      for (const orderId of orderIds) {
        await handleProcessPayment(orderId, totalAmount / orderIds.length, paymentType);
      }
    } catch (error) {
      console.error('Error processing bulk payment:', error);
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      await downloadInvoiceMutation.mutateAsync(orderId);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  // کامپوننت کارت سفارش
  const OrderCard = ({ order, showActions = true }) => {
    const isSelected = selectedOrders.includes(order.id);
    
    const handleSelectOrder = () => {
      if (isSelected) {
        setSelectedOrders(prev => prev.filter(id => id !== order.id));
      } else {
        setSelectedOrders(prev => [...prev, order.id]);
      }
    };

    const getActionButtons = () => {
      switch (order.status) {
        case 'quoted':
        case 'accepted':
        case 'project_paid':
          return (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/orders/${order.id}`}>
                  <Eye className="h-4 w-4 ml-2" />
                  مشاهده جزئیات
                </Link>
              </Button>
            </div>
          );
        case 'in_progress':
          return (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 ml-2" />
                پیگیری پروژه
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 ml-2" />
                پشتیبانی
              </Button>
            </div>
          );
        case 'completed':
          return (
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleProcessPayment(order.id, calculateRemainingAmount(order.total_amount), 'final')}
                disabled={processPaymentMutation.isPending}
              >
                <CreditCard className="h-4 w-4 ml-2" />
                پرداخت نهایی (50%)
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadInvoice(order.id)}
                disabled={downloadInvoiceMutation.isPending}
              >
                <Download className="h-4 w-4 ml-2" />
                دانلود فاکتور
              </Button>
            </div>
          );
        default:
          return (
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 ml-2" />
              مشاهده جزئیات
            </Button>
          );
      }
    };

    return (
      <Card className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {showActions && (order.status === 'quoted' || order.status === 'proposal_accepted' || order.status === 'accepted') && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleSelectOrder}
                className="mt-1 h-4 w-4 text-blue-600"
              />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">تاریخ سفارش:</span>
                  <p>{new Date(order.created_at).toLocaleDateString('fa-IR')}</p>
                </div>
                <div>
                  <span className="font-medium">مبلغ کل:</span>
                  <p className="text-green-600 font-semibold">
                    {order.total_amount ? `${formatPriceNumber(order.total_amount)} تومان` : 'در انتظار قیمت‌گذاری'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">تعداد آیتم‌ها:</span>
                  <p>{order.items?.length || 0} آیتم</p>
                </div>
              </div>
              
              {order.notes && (
                <div className="mb-4">
                  <span className="font-medium text-sm text-gray-600">یادداشت:</span>
                  <p className="text-sm text-gray-700 mt-1">{order.notes}</p>
                </div>
              )}

              {/* نمایش پرداخت ۴ مرحله‌ای (۲۵٪ در هر مرحله) */}
              {(order.status === 'quoted' || order.status === 'proposal_accepted' || order.status === 'accepted' || order.status === 'project_paid') && (
                <div className="mb-4">
                  <OrderPaymentPhases
                    orderId={order.id}
                    orderNumber={order.order_number}
                    totalAmount={order.total_amount}
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              {getActionButtons()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
              <h1 className="text-3xl font-bold text-gray-900">مدیریت سفارشات</h1>
              <p className="text-gray-600">پیگیری و مدیریت سفارشات شما</p>
          </div>
            <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/orders">
              <Eye className="h-4 w-4 ml-2" />
              مشاهده همه سفارشات
            </Link>
          </Button>
              <Button asChild variant="outline">
                <Link to="/quotes">
                  <MessageCircle className="h-4 w-4 ml-2" />
                  پیشنهادات دریافتی
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/notifications">
                  <Bell className="h-4 w-4 ml-2" />
                  اعلان‌ها
                </Link>
              </Button>
            </div>
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
                    <SelectItem value="quoted">قیمت‌گذاری شده</SelectItem>
                    <SelectItem value="accepted">تایید شده</SelectItem>
                      <SelectItem value="in_progress">در حال انجام</SelectItem>
                      <SelectItem value="completed">تکمیل شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quoted" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                قیمت‌گذاری شده ({filteredQuotedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="accepted" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                تایید شده ({filteredAcceptedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                در حال انجام ({filteredInProgressOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                تکمیل شده ({filteredCompletedOrders.length})
              </TabsTrigger>
            </TabsList>

            {/* Tab Content - Quoted Orders */}
            <TabsContent value="quoted" className="space-y-4">
              {filteredQuotedOrders.length > 0 ? (
                <>
                  {/* Bulk Actions */}
                  {filteredQuotedOrders.length > 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={selectedOrders.length === filteredQuotedOrders.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOrders(filteredQuotedOrders.map(order => order.id));
                                } else {
                                  setSelectedOrders([]);
                                }
                              }}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="font-medium text-blue-800">
                              انتخاب همه ({selectedOrders.length} از {filteredQuotedOrders.length})
                            </span>
                      </div>
                          {selectedOrders.length > 0 && (
                            <Button
                              onClick={() => handleBulkPayment(selectedOrders, quotedTotal, 'deposit')}
                              disabled={processPaymentMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CreditCard className="h-4 w-4 ml-2" />
                              پرداخت بیعانه همه ({formatPriceNumber(quotedDeposit)} تومان)
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Orders List */}
                  <div className="space-y-4">
                    {filteredQuotedOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>

                  {/* Summary */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="h-6 w-6 text-blue-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900">سفارشات قیمت‌گذاری شده</h3>
                            <p className="text-sm text-blue-700">آماده برای پرداخت بیعانه</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-900">
                            {formatPriceNumber(quotedTotal)} تومان
                          </div>
                          <div className="text-sm text-blue-700">
                            {filteredQuotedOrders.length} سفارش
                          </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">سفارش قیمت‌گذاری شده‌ای یافت نشد</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' 
                        ? 'با فیلترهای انتخابی سفارش قیمت‌گذاری شده‌ای یافت نشد'
                        : 'هنوز سفارش قیمت‌گذاری شده‌ای دریافت نکرده‌اید'
                }
              </p>
              <Button asChild>
                <Link to="/orders">مشاهده همه سفارشات</Link>
              </Button>
            </CardContent>
          </Card>
        )}
            </TabsContent>

            {/* Tab Content - Accepted Orders */}
            <TabsContent value="accepted" className="space-y-4">
              {filteredAcceptedOrders.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {filteredAcceptedOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-green-900">سفارشات تایید شده</h3>
                            <p className="text-sm text-green-700">آماده برای شروع پروژه</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-900">
                            {formatPriceNumber(acceptedTotal)} تومان
                          </div>
                          <div className="text-sm text-green-700">
                            {filteredAcceptedOrders.length} سفارش
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">سفارش تایید شده‌ای یافت نشد</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'با فیلترهای انتخابی سفارش تایید شده‌ای یافت نشد'
                        : 'هنوز سفارش تایید شده‌ای دریافت نکرده‌اید'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab Content - In Progress Orders */}
            <TabsContent value="in_progress" className="space-y-4">
              {filteredInProgressOrders.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {filteredInProgressOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="h-6 w-6 text-orange-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-orange-900">پروژه‌های فعال</h3>
                            <p className="text-sm text-orange-700">در حال انجام توسط پیمانکاران</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-900">
                            {formatPriceNumber(inProgressTotal)} تومان
                          </div>
                          <div className="text-sm text-orange-700">
                            {filteredInProgressOrders.length} پروژه
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">پروژه فعالی یافت نشد</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'با فیلترهای انتخابی پروژه فعالی یافت نشد'
                        : 'هنوز پروژه فعالی ندارید'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab Content - Completed Orders */}
            <TabsContent value="completed" className="space-y-4">
              {filteredCompletedOrders.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {filteredCompletedOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                            <h3 className="text-lg font-semibold text-green-900">پروژه‌های تکمیل شده</h3>
                            <p className="text-sm text-green-700">آماده برای پرداخت نهایی</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-900">
                            {formatPriceNumber(completedTotal)} تومان
                  </div>
                  <div className="text-sm text-green-700">
                            {filteredCompletedOrders.length} پروژه
                  </div>
                </div>
              </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">پروژه تکمیل شده‌ای یافت نشد</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'با فیلترهای انتخابی پروژه تکمیل شده‌ای یافت نشد'
                        : 'هنوز پروژه تکمیل شده‌ای ندارید'
                      }
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

export default Cart;