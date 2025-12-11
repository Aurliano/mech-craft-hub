import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, Filter, Plus, Eye, MessageCircle, Clock, 
  DollarSign, Calendar, User, Package, CheckCircle,
  AlertCircle, TrendingUp, Award, Star, RefreshCw,
  ChevronDown, ChevronUp, FileText, Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateQuote } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

interface Service {
  id: string;
  name: string;
  type: string;
  description?: string;
  scope?: string;
}

interface ServiceField {
  id: string;
  name: string;
  field_key: string;
  type: string;
  options?: { value: string; label: string }[] | string[];
  is_required: boolean;
  order: number;
  help_text?: string;
  validation_rules?: Record<string, unknown>;
}

interface OrderItem {
  id: string;
  service?: Service;
  service_fields?: ServiceField[];
  needs_documentation: boolean;
  field_values: Record<string, unknown>;
  status: string;
  price?: number;
  estimated_delivery?: string;
  actual_delivery?: string;
  assigned_contractor?: string;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  notes: string;
  created_at: string;
  customer: {
    username: string;
  };
  items: OrderItem[];
}

interface Quote {
  id: string;
  order_item: {
    id: string;
    service: {
      name: string;
    };
    order: {
      id?: string;
      order_number: string;
    };
  };
  price: number;
  documentation_price: number;
  delivery_days: number;
  documentation_days: number;
  notes: string;
  status: string;
  created_at: string;
}

const ContractorQuotes = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('available');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    order_item: '',
    price: '',
    documentation_price: '',
    delivery_days: '',
    documentation_days: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
  // Quote creation hook
  const createQuoteMutation = useCreateQuote();

  useEffect(() => {
    fetchOrders();
    fetchQuotes();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl('/api/v1/contractor/orders/'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/contractor/proposals/'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuotes(data);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert empty strings to undefined for optional fields (so serializer uses defaults)
      const formData: {
        order_item: string;
        contractor: string;
        price: number;
        documentation_price?: number;
        delivery_days: number;
        documentation_days?: number;
        notes?: string;
      } = {
        order_item: quoteForm.order_item,
        contractor: (user as unknown as { id?: string })?.id || '',
        price: parseFloat(quoteForm.price),
        delivery_days: parseInt(quoteForm.delivery_days),
        notes: quoteForm.notes || undefined,
      };
      
      // Only include documentation fields if they have values
      if (quoteForm.documentation_price && quoteForm.documentation_price.trim() !== '') {
        formData.documentation_price = parseFloat(quoteForm.documentation_price);
      }
      
      if (quoteForm.documentation_days && quoteForm.documentation_days.trim() !== '') {
        formData.documentation_days = parseInt(quoteForm.documentation_days);
      }
      
      await createQuoteMutation.mutateAsync(formData);
      setIsQuoteDialogOpen(false);
      setQuoteForm({
        order_item: '',
        price: '',
        documentation_price: '',
        delivery_days: '',
        documentation_days: '',
        notes: ''
      });
      // Refresh quotes after successful creation
      fetchQuotes();
    } catch (error: unknown) {
      console.error('Error creating quote:', error);
      
      // Handle specific error cases
      const errMsg = (error as { message?: string })?.message || '';
      if (errMsg.includes('شما قبلاً برای این آیتم سفارش پیشنهاد ارسال کرده‌اید')) {
        setError('شما قبلاً برای این آیتم سفارش پیشنهاد ارسال کرده‌اید. لطفاً پیشنهاد قبلی خود را ویرایش کنید.');
      } else if (errMsg.includes('UNIQUE constraint failed')) {
        setError('شما قبلاً برای این آیتم سفارش پیشنهاد ارسال کرده‌اید.');
      } else {
        setError(errMsg || 'خطا در ایجاد پیشنهاد');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasExistingQuote = (itemId: string): boolean => {
    return quotes.some(quote => quote.order_item.id === itemId);
  };

  const openQuoteDialog = (order: Order, itemId: string) => {
    // Check if contractor already has a quote for this item
    if (hasExistingQuote(itemId)) {
      setError('شما قبلاً برای این آیتم سفارش پیشنهاد ارسال کرده‌اید. لطفاً پیشنهاد قبلی خود را ویرایش کنید.');
      return;
    }
    
    setSelectedOrder(order);
    setQuoteForm(prev => ({
      ...prev,
      order_item: itemId,
      documentation_price: '',
      documentation_days: ''
    }));
    setIsQuoteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'submitted': { label: 'ارسال شده', variant: 'default' as const, icon: Clock },
      'in_review': { label: 'در حال بررسی', variant: 'secondary' as const, icon: Eye },
      'quoted': { label: 'قیمت‌گذاری شده', variant: 'default' as const, icon: DollarSign },
      'accepted': { label: 'تایید شده', variant: 'default' as const, icon: CheckCircle },
      'in_progress': { label: 'در حال انجام', variant: 'default' as const, icon: Package },
      'completed': { label: 'تکمیل شده', variant: 'default' as const, icon: CheckCircle },
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

  const getQuoteStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'در انتظار', variant: 'secondary' as const, icon: Clock },
      'accepted': { label: 'تایید شده', variant: 'default' as const, icon: CheckCircle },
      'rejected': { label: 'رد شده', variant: 'destructive' as const, icon: AlertCircle },
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableOrders = filteredOrders.filter(order => 
    order.status === 'submitted' || order.status === 'in_review'
  );

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مدیریت پیشنهادات</h1>
              <p className="text-gray-600">ارسال پیشنهاد برای سفارشات و مدیریت پیشنهادات موجود</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/contractor/projects">
                  <Package className="h-4 w-4 ml-2" />
                  پروژه‌های من
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contractor/stats">
                  <TrendingUp className="h-4 w-4 ml-2" />
                  آمار و گزارش‌ها
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
                      <SelectItem value="submitted">ارسال شده</SelectItem>
                      <SelectItem value="in_review">در حال بررسی</SelectItem>
                      <SelectItem value="quoted">قیمت‌گذاری شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                سفارشات موجود ({availableOrders.length})
              </TabsTrigger>
              <TabsTrigger value="my_quotes" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                پیشنهادات من ({quotes.length})
              </TabsTrigger>
            </TabsList>

            {/* Available Orders Tab */}
            <TabsContent value="available" className="space-y-4">
              {availableOrders.length > 0 ? (
                <div className="space-y-4">
                  {availableOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString('fa-IR')}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOrderDetails(order.id)}
                              className="flex items-center gap-1"
                            >
                              {expandedOrders.has(order.id) ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  مخفی کردن جزئیات
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  نمایش جزئیات
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">مشتری:</span>
                            <p>{order.customer.username}</p>
                          </div>
                          <div>
                            <span className="font-medium">مبلغ کل:</span>
                            <p className="text-green-600 font-semibold">
                              {order.total_amount ? `${order.total_amount.toLocaleString()} تومان` : 'در انتظار قیمت‌گذاری'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">تعداد آیتم‌ها:</span>
                            <p>{order.items.length} آیتم</p>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="mb-4">
                            <span className="font-medium text-sm text-gray-600">یادداشت:</span>
                            <p className="text-sm text-gray-700 mt-1">{order.notes}</p>
                          </div>
                        )}

                        {/* Expandable Details Section */}
                        {expandedOrders.has(order.id) && (
                          <div className="border-t pt-4 mt-4 space-y-4">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <h4 className="font-semibold text-gray-900">جزئیات کامل سفارش</h4>
                            </div>
                            
                            {/* Order Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                              <div>
                                <span className="font-medium text-gray-700">شماره سفارش:</span>
                                <p className="text-gray-900">{order.order_number}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">تاریخ ایجاد:</span>
                                <p className="text-gray-900">{new Date(order.created_at).toLocaleDateString('fa-IR')}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">وضعیت:</span>
                                <div className="mt-1">{getStatusBadge(order.status)}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">مشتری:</span>
                                <p className="text-gray-900">{order.customer.username}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">مبلغ کل:</span>
                                <p className="text-gray-900 font-semibold">
                                  {order.total_amount ? `${order.total_amount.toLocaleString()} تومان` : 'در انتظار قیمت‌گذاری'}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">تعداد آیتم‌ها:</span>
                                <p className="text-gray-900">{order.items.length} آیتم</p>
                              </div>
                            </div>

                            {/* Service Items Details */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-green-600" />
                                <h5 className="font-semibold text-gray-900">جزئیات سرویس‌ها</h5>
                              </div>
                              {order.items.map((item, index) => (
                                <div key={item.id} className="p-4 bg-gray-50 rounded-lg border">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                          آیتم {index + 1}
                                        </span>
                                        <h6 className="font-semibold text-gray-900">
                                          {item.service?.name || 'Unknown Service'}
                                        </h6>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <span className="font-medium text-gray-600">نوع سرویس:</span>
                                          <p className="text-gray-900">{item.service?.type || 'نامشخص'}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-600">حوزه:</span>
                                          <p className="text-gray-900">{item.service?.scope || 'نامشخص'}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-600">نیاز به مستندات:</span>
                                          <p className="text-gray-900">
                                            {item.needs_documentation ? 'بله' : 'خیر'}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-600">توضیحات سرویس:</span>
                                          <p className="text-gray-900">{item.service?.description || 'بدون توضیحات'}</p>
                                        </div>
                                      </div>
                                      
                                      {/* Service Fields */}
                                      {item.service_fields && item.service_fields.length > 0 && (
                                        <div className="mt-4">
                                          <span className="font-medium text-gray-600 mb-2 block">فیلدهای سرویس:</span>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {item.service_fields.map((field: ServiceField) => (
                                              <div key={field.id} className="p-3 bg-white rounded border">
                                                <div className="flex items-center justify-between mb-2">
                                                  <span className="font-medium text-gray-700">{field.name}</span>
                                                  {field.is_required && (
                                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                      الزامی
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                  <span className="font-medium">نوع:</span> {field.type}
                                                </div>
                                                {field.help_text && (
                                                  <div className="text-xs text-gray-500 mt-1">
                                                    {field.help_text}
                                                  </div>
                                                )}
                                                {item.field_values && item.field_values[field.field_key] && (
                                                  <div className="mt-2 p-2 bg-gray-50 rounded">
                                                    <span className="font-medium text-gray-700">مقدار وارد شده:</span>
                                                    <div className="text-gray-900 mt-1">
                                                      {renderFieldValue(item.field_values[field.field_key])}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Field Values */}
                                      {item.field_values && Object.keys(item.field_values).length > 0 && (
                                        <div className="mt-4">
                                          <span className="font-medium text-gray-600 mb-2 block">مشخصات پروژه:</span>
                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            {renderFieldValues(item.field_values)}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {hasExistingQuote(item.id) ? (
                                      <div className="ml-4 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-600 font-medium">
                                          پیشنهاد ارسال شده
                                        </span>
                                      </div>
                                    ) : (
                                      <Button
                                        onClick={() => openQuoteDialog(order, item.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
                                        size="sm"
                                      >
                                        <Plus className="h-4 w-4 ml-2" />
                                        ارسال پیشنهاد
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Basic Items List (when not expanded) */}
                        {!expandedOrders.has(order.id) && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">آیتم‌های سفارش:</h4>
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{item.service?.name || 'Unknown Service'}</h5>
                                  <p className="text-sm text-gray-600">
                                    نوع: {item.service?.type || 'نامشخص'}
                                    {item.service?.scope && ` • حوزه: ${item.service.scope}`}
                                    {item.needs_documentation && ' • نیاز به مستندات'}
                                  </p>
                                  {item.service?.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                      {item.service.description}
                                    </p>
                                  )}
                                </div>
                                {hasExistingQuote(item.id) ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-600 font-medium">
                                      پیشنهاد ارسال شده
                                    </span>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => openQuoteDialog(order, item.id)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Plus className="h-4 w-4 ml-2" />
                                    ارسال پیشنهاد
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Plus className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">سفارش موجودی یافت نشد</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'با فیلترهای انتخابی سفارش موجودی یافت نشد'
                        : 'در حال حاضر سفارش جدیدی برای پیشنهاد وجود ندارد'
                      }
                    </p>
                    <Button onClick={fetchOrders}>
                      <RefreshCw className="h-4 w-4 ml-2" />
                      بروزرسانی
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* My Quotes Tab */}
            <TabsContent value="my_quotes" className="space-y-4">
              {quotes.length > 0 ? (
                <div className="space-y-4">
                  {quotes.map((quote) => (
                    <Card key={quote.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {quote.order_item?.service?.name || 'Unknown Service'}
                              </h3>
                              {getQuoteStatusBadge(quote.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                              <div>
                                <span className="font-medium">شماره سفارش:</span>
                                <p>{quote.order_item.order.order_number}</p>
                              </div>
                              <div>
                                <span className="font-medium">قیمت پیشنهادی:</span>
                                <p className="text-green-600 font-semibold">
                                  {quote.price.toLocaleString()} تومان
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">زمان تحویل:</span>
                                <p>{quote.delivery_days} روز</p>
                              </div>
                              {quote.documentation_price > 0 && (
                                <div>
                                  <span className="font-medium">قیمت مستندات:</span>
                                  <p className="text-blue-600 font-semibold">
                                    {quote.documentation_price.toLocaleString()} تومان
                                  </p>
                                </div>
                              )}
                              <div>
                                <span className="font-medium">تاریخ ارسال:</span>
                                <p>{new Date(quote.created_at).toLocaleDateString('fa-IR')}</p>
                              </div>
                            </div>

                            {quote.notes && (
                              <div className="mb-4">
                                <span className="font-medium text-sm text-gray-600">یادداشت:</span>
                                <p className="text-sm text-gray-700 mt-1">{quote.notes}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/orders/${quote.order_item.order.id}`}>
                                <Eye className="h-4 w-4 ml-2" />
                                مشاهده جزئیات
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/support?order=${quote.order_item.order.id}`, '_blank')}
                            >
                              <MessageCircle className="h-4 w-4 ml-2" />
                              پیام به مشتری
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
                    <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">پیشنهادی ارسال نکرده‌اید</h3>
                    <p className="text-gray-600 mb-6">
                      برای شروع، روی سفارشات موجود پیشنهاد ارسال کنید
                    </p>
                    <Button onClick={() => setActiveTab('available')}>
                      <Plus className="h-4 w-4 ml-2" />
                      مشاهده سفارشات
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Quote Dialog */}
          <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>ارسال پیشنهاد جدید</DialogTitle>
                <DialogDescription>
                  برای این سفارش پیشنهاد قیمت و زمان تحویل خود را ارسال کنید
                </DialogDescription>
              </DialogHeader>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleCreateQuote} className="space-y-4">
                {/* Get selected item to check for documentation requirement */}
                {(() => {
                  const selectedItem = selectedOrder?.items.find(i => i.id === quoteForm.order_item);
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">قیمت پیشنهادی (تومان) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={quoteForm.price}
                          onChange={(e) => setQuoteForm(prev => ({ ...prev, price: e.target.value }))}
                          required
                          placeholder="مبلغ پیشنهادی"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="delivery_days">زمان تحویل (روز) *</Label>
                        <Input
                          id="delivery_days"
                          type="number"
                          value={quoteForm.delivery_days}
                          onChange={(e) => setQuoteForm(prev => ({ ...prev, delivery_days: e.target.value }))}
                          required
                          placeholder="تعداد روز"
                        />
                      </div>
                      
                      {selectedItem?.needs_documentation && (
                        <>
                          <div className="col-span-full">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">
                                این آیتم دارای درخواست مستندسازی است. لطفاً قیمت و زمان آن را جداگانه وارد کنید.
                              </span>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="documentation_price">قیمت مستندات (تومان)</Label>
                            <Input
                              id="documentation_price"
                              type="number"
                              value={quoteForm.documentation_price}
                              onChange={(e) => setQuoteForm(prev => ({ ...prev, documentation_price: e.target.value }))}
                              placeholder="0"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="documentation_days">زمان مستندات (روز)</Label>
                            <Input
                              id="documentation_days"
                              type="number"
                              value={quoteForm.documentation_days}
                              onChange={(e) => setQuoteForm(prev => ({ ...prev, documentation_days: e.target.value }))}
                              placeholder="0"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
                
                <div>
                  <Label htmlFor="notes">یادداشت (اختیاری)</Label>
                  <Textarea
                    id="notes"
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="توضیحات اضافی درباره پیشنهاد..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsQuoteDialogOpen(false)}
                  >
                    انصراف
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? 'در حال ارسال...' : 'ارسال پیشنهاد'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ContractorQuotes;
