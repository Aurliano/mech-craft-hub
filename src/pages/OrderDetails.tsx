import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Package, Clock, User, Calendar, FileText,
  Eye, MessageCircle, CheckCircle, XCircle,
  AlertCircle, Award, Settings, Truck, Edit, Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGetOrderById, useGetQuotesByOrder, useAcceptQuote, useRejectQuote, useAddOrderToCart } from '@/hooks/useAuth';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { getPersianLabel, getPersianValue } from '@/lib/persianMapping';
import { getApiUrl } from '@/lib/api';
import { normalizeFilePaths, renderFileFieldValue } from '@/lib/fieldDisplay';
import { CAPABILITIES_WITH_MACHINES } from '@/data/capabilitiesAndMachines';
import { formatPriceNumber } from '@/lib/priceUtils';

interface OrderItem {
  id: string;
  service: {
    id: string;
    name: string;
    description: string;
  };
  field_values: Record<string, unknown>;
  service_fields?: Array<{
    field_key: string;
    name: string;
    type: string;
    options?: unknown;
  }>;
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
  project_progress_phase?: number;
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
  const isStaff = (user as { is_staff?: boolean })?.is_staff === true;
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  // API Hooks
  const { data: orderData, isLoading: isLoadingOrder } = useGetOrderById(orderId);
  const { data: quotesData, isLoading: isLoadingQuotes } = useGetQuotesByOrder(orderId);
  const acceptQuoteMutation = useAcceptQuote();
  const rejectQuoteMutation = useRejectQuote();
  const addToCartMutation = useAddOrderToCart();
  const [rejectDialogQuote, setRejectDialogQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (orderData) {
      setOrder(orderData as unknown as Order);
    }
  }, [orderData]);

  useEffect(() => {
    if (quotesData) {
      setQuotes(quotesData as unknown as Quote[]);
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

  const formatFieldValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return 'تعریف نشده';

    // Handle string booleans
    if (value === 'true' || value === true) return 'بله';
    if (value === 'false' || value === false) return 'خیر';

    if (typeof value === 'boolean') return value ? 'بله' : 'خیر';

    // Handle file fields (single or multiple) - show all files with download links
    const filePaths = normalizeFilePaths(value);
    if (filePaths.length > 0) return renderFileFieldValue(value);

    if (typeof value === 'string') {
      // Check for common boolean strings from checkbox inputs
      if (value.toLowerCase() === 'on') return 'بله';
      if (value.toLowerCase() === 'off') return 'خیر';
    }

    if (Array.isArray(value)) {
      return (
        <div className="flex flex-col gap-1">
          {value.map((v, i) => (
            <div key={i}>{formatFieldValue(v)}</div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') return JSON.stringify(value);

    // Use Persian value mapping for other strings
    return getPersianValue(value as string);
  };

  const renderFieldValues = (item: OrderItem) => {
    const { field_values, service_fields, needs_documentation } = item;

    // Flatten field values if they are nested (e.g. from keys like 'tab1_field1')
    // Use service_fields to lookup correct label

    const allFields = { ...field_values };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {Object.entries(allFields).map(([key, value]) => {
          // Ignore keys that might be internal or not fields
          if (key === 'needs_documentation' || key === 'documentationNotes') return null;

          // Find field definition
          // First try direct match
          let fieldDef = service_fields?.find(f => f.field_key === key);

          // If not found, try to match if key has prefix (e.g., UUID_fieldkey)
          if (!fieldDef && service_fields) {
            // Sometimes keys are just field_key, sometimes they might be prefixed.
            // But based on serializer, field_values keys might matched field_key.
            // Let's rely on field_key
            fieldDef = service_fields.find(f => key.endsWith(f.field_key));
          }

          const label = fieldDef?.name || getPersianLabel(key);

          // Special UI for manufacturing processes: show selected processes as badges with Persian labels
          if (key === 'manufacturing_processes') {
            const ids = Array.isArray(value) ? value : [value];
            const processes = ids
              .filter((v): v is string => typeof v === 'string')
              .map((id) => {
                const cap = CAPABILITIES_WITH_MACHINES.find((c) => c.id === id);
                return cap?.name || id;
              })
              .filter(Boolean);

            if (processes.length === 0) return null;

            return (
              <div key={key} className="py-3 border-b border-gray-100">
                <span className="block font-medium text-gray-600 text-sm mb-2">
                  {label}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {processes.map((name) => (
                    <Badge key={name} variant="secondary" className="px-3 py-1 text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="py-3 border-b border-gray-100">
              <span className="block font-medium text-gray-600 text-sm mb-1">{label}:</span>
              <span className="block text-gray-900 text-sm font-semibold break-words">
                {formatFieldValue(value)}
              </span>
            </div>
          );
        })}
        <div className="py-3 border-b border-gray-100">
          <span className="block font-medium text-gray-600 text-sm mb-1">نیاز به مستندات:</span>
          <span className="block text-gray-900 text-sm font-semibold">
            {getPersianValue(needs_documentation)}
          </span>
        </div>
      </div>
    );
  };

  const handleAcceptQuote = async (quoteId: string) => {
    if (!order) return;
    try {
      await acceptQuoteMutation.mutateAsync(quoteId);
      // پس از تایید، سفارش را به سبد خرید اضافه کن
      await addToCartMutation.mutateAsync(order.id);
    } catch (err) {
      console.error('Error accepting quote:', err);
      setError('خطا در تایید پیشنهاد');
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    try {
      await rejectQuoteMutation.mutateAsync(quoteId);
    } catch (err) {
      console.error('Error rejecting quote:', err);
      setError('خطا در رد پیشنهاد');
    } finally {
      setRejectDialogQuote(null);
    }
  };

  const handleDelete = async () => {
    if (!orderId || !window.confirm('آیا از حذف این سفارش اطمینان دارید؟')) return;
    try {
      const response = await fetch(getApiUrl(`/v1/orders/${orderId}/`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        navigate('/orders');
      } else {
        console.error('Failed to delete order');
        alert('حذف سفارش با خطا مواجه شد');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                جزئیات سفارش <span className="text-primary">{order.order_number}</span>
              </h1>
            </div>
            <div className="flex gap-2">
              {order.status === 'submitted' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${order.id}/edit`)}>
                    <Edit className="h-4 w-4 ml-2" />
                    ویرایش
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف
                  </Button>
                </>
              )}
              <Button asChild variant="outline" size="sm">
                <Link to="/orders">
                  <Eye className="h-4 w-4 ml-2" />
                  بازگشت
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/support">
                  <MessageCircle className="h-4 w-4 ml-2" />
                  پشتیبانی
                </Link>
              </Button>
            </div>
          </div>

          {/* Admin: ویرایش پیشرفت پروژه */}
          {isStaff && order.status !== 'submitted' && order.status !== 'cancelled' && (
            <Card className="shadow-md border-amber-200 bg-amber-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">ویرایش پیشرفت پروژه (ادمین)</CardTitle>
                <CardDescription>پیشرفت پروژه را بر اساس مراحل انجام‌شده تنظیم کنید. پس از هر مرحله، پرداخت مرحله بعد برای مشتری فعال می‌شود.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">مرحله پیشرفت:</label>
                  <select
                    value={order.project_progress_phase ?? 0}
                    onChange={async (e) => {
                      const val = parseInt(e.target.value, 10);
                      try {
                        const res = await fetch(getApiUrl(`/v1/orders/${order.id}/`), {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                          },
                          body: JSON.stringify({ project_progress_phase: val }),
                        });
                        if (res.ok) {
                          const updated = await res.json();
                          setOrder(updated);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="rounded border px-3 py-2"
                  >
                    <option value={0}>۰ - شروع نشده</option>
                    <option value={1}>۱ - مرحله ۱ پرداخت شده</option>
                    <option value={2}>۲ - مرحله ۲ پرداخت شده</option>
                    <option value={3}>۳ - مرحله ۳ پرداخت شده</option>
                    <option value={4}>۴ - همه مراحل پرداخت شده</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Status Card */}
          <Card className="shadow-md border-t-4 border-t-primary">
            <CardHeader className="bg-gray-50/50 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-lg">وضعیت کلی</CardTitle>
                  </div>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">تاریخ ایجاد</p>
                    <p className="font-semibold text-sm">{new Date(order.created_at).toLocaleDateString('fa-IR')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">مشتری</p>
                    <p className="font-semibold text-sm">{order.customer.first_name} {order.customer.last_name || order.customer.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">تعداد آیتم</p>
                    <p className="font-semibold text-sm">{order.items.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1 rounded-lg">
              <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <FileText className="h-4 w-4 ml-2" />
                جزئیات فنی (فاکتور)
              </TabsTrigger>
              <TabsTrigger value="quotes" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <MessageCircle className="h-4 w-4 ml-2" />
                پیشنهادات ({quotes.length})
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Settings className="h-4 w-4 ml-2" />
                یادداشت‌ها
              </TabsTrigger>
            </TabsList>

            {/* Order Details Tab (Invoice Style) */}
            <TabsContent value="details" className="space-y-6 mt-6">
              {order.items.map((item, index) => (
                <Card key={item.id} className="overflow-hidden border border-gray-300 shadow-sm print:shadow-none">
                  <div className="bg-gray-100 p-4 border-b border-gray-300 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                        ردیف {index + 1}
                      </span>
                      <h3 className="font-bold text-gray-800">{item.service.name}</h3>
                    </div>
                    {/* Hide price here as it depends on quote */}
                  </div>

                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 divide-y divide-gray-200">
                      {/* Service Description */}
                      <div className="p-4 bg-white">
                        <p className="text-sm text-gray-600 mb-1 font-medium">توضیحات سرویس:</p>
                        <p className="text-gray-800 text-sm leading-relaxed">{item.service.description}</p>
                      </div>

                      {/* Technical Specs */}
                      <div className="p-4 bg-white">
                        <h4 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                          <Settings className="h-4 w-4 text-primary" />
                          مشخصات فنی و فایل‌ها
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          {renderFieldValues(item)}
                        </div>
                      </div>

                      {/* Documentation Requirements */}
                      <div className="p-4 bg-white">
                        <h4 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          مستندات و یادداشت‌ها
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-2">گزینه‌های مستندات:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(order.documentation_options || {}).some(([_, v]) => v) ? (
                                Object.entries(order.documentation_options || {}).map(([key, value]) => (
                                  value && (
                                    <div key={key} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-100 text-xs">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>{getPersianLabel(key)}</span>
                                    </div>
                                  )
                                ))
                              ) : (
                                <span className="text-sm text-gray-400">موردی انتخاب نشده است</span>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">یادداشت مستندات:</p>
                            <p className="text-sm text-gray-800">
                              {getPersianValue(item.field_values.documentationNotes as string)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Quotes Tab */}
            <TabsContent value="quotes" className="space-y-4 mt-6">
              {quotes.length > 0 ? (
                quotes.map((quote) => (
                  <Card key={quote.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardHeader className="bg-gray-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{quote.contractor.username}</CardTitle>
                            <CardDescription className="text-xs">
                              {new Date(quote.created_at).toLocaleDateString('fa-IR')}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {quote.status === 'pending' && (
                            <Badge variant="secondary">در انتظار بررسی</Badge>
                          )}
                          {quote.status === 'accepted' && (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 ml-1" />
                              پیشنهاد تایید شده
                            </Badge>
                          )}
                          {quote.status === 'rejected' && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 ml-1" />
                              پیشنهاد رد شده
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white p-3 rounded border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">قیمت پیشنهادی پروژه</p>
                          <p className="font-bold text-green-600 text-lg">{formatPriceNumber(quote.price)} <span className="text-xs font-normal text-gray-500">تومان</span></p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">زمان تحویل</p>
                          <p className="font-bold text-gray-800">{quote.delivery_days} <span className="text-xs font-normal text-gray-500">روز</span></p>
                        </div>
                        {quote.documentation_price > 0 && (
                          <div className="bg-white p-3 rounded border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">هزینه مستندات</p>
                            <p className="font-bold text-blue-600">{formatPriceNumber(quote.documentation_price)} <span className="text-xs font-normal text-gray-500">تومان</span></p>
                          </div>
                        )}
                      </div>

                      {quote.notes && (
                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 mb-4 border border-gray-100">
                          <span className="font-bold block mb-1">توضیحات پیمانکار:</span>
                          {quote.notes}
                        </div>
                      )}

                      {/* Actions for Customer - only for pending quotes */}
                      <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-gray-100">
                        {quote.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAcceptQuote(quote.id)}
                              disabled={acceptQuoteMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 ml-2" />
                              {acceptQuoteMutation.isPending ? 'در حال تایید...' : 'تایید پیشنهاد'}
                            </Button>
                            <Button
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 border-red-200"
                              onClick={() => setRejectDialogQuote(quote)}
                              disabled={rejectQuoteMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 ml-2" />
                              رد پیشنهاد
                            </Button>
                          </>
                        )}
                        {quote.status === 'accepted' && (
                          <Button asChild variant="outline" size="sm">
                            <Link to="/cart">
                              <Package className="h-4 w-4 ml-2" />
                              مشاهده سبد خرید و پرداخت
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900">هنوز پیشنهادی دریافت نشده است</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    به محض دریافت پیشنهاد از پیمانکاران، در این بخش نمایش داده خواهد شد.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>یادداشت‌های شما</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.notes ? (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-900">
                      {order.notes}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">یادداشتی ثبت نشده است</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Reject Proposal Confirmation Dialog */}
          <AlertDialog open={!!rejectDialogQuote} onOpenChange={(open) => !open && setRejectDialogQuote(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>رد پیشنهاد</AlertDialogTitle>
                <AlertDialogDescription>
                  آیا از رد کردن این پیشنهاد مطمئن هستید؟
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 sm:gap-0">
                <AlertDialogCancel>خیر</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    if (rejectDialogQuote) handleRejectQuote(rejectDialogQuote.id);
                  }}
                  disabled={rejectQuoteMutation.isPending}
                >
                  {rejectQuoteMutation.isPending ? 'در حال رد...' : 'بله، رد کن'}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
