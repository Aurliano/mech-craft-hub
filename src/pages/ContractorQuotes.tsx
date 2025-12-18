import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  Search, Plus, Eye, MessageCircle, Clock, 
  DollarSign, Package, CheckCircle,
  AlertCircle, TrendingUp,
  ChevronDown, ChevronUp, FileText, Settings, Download, Trash2, Edit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateQuote } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import PriceInput from '@/components/PriceInput';
import { getPersianLabel, getPersianValue } from '@/lib/persianMapping';

// ... (Interfaces remain similar, ensuring correct structure)
interface Service {
    id: string;
    name: string;
    type: string;
    description?: string;
}

interface ServiceField {
    id: string;
    name: string;
    field_key: string;
    type: string;
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
  created_at: string;
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
  documentation_options?: Record<string, boolean>;
}

interface Quote {
  id: string;
  order_item: {
    id: string;
    service: { name: string; };
    order: { id: string; order_number: string; };
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
  const [activeTab, setActiveTab] = useState('available');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
  // Quote Dialog State
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  const createQuoteMutation = useCreateQuote();

  useEffect(() => {
    fetchOrders();
    fetchQuotes();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl('/api/v1/contractor/orders/'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (response.ok) setOrders(await response.json());
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  };

  const fetchQuotes = async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/contractor/proposals/'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (response.ok) setQuotes(await response.json());
    } catch (err) { console.error(err); }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  // Improved Render Field Value with Download Links
  const renderFieldValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return 'تعریف نشده';
    if (typeof value === 'boolean') return value ? 'بله' : 'خیر';
    
    if (typeof value === 'string') {
        if (value.startsWith('http') || value.startsWith('/media') || value.startsWith('user-uploads/') || value.includes('uploads/')) {
            const fileName = value.split('/').pop() || 'دانلود فایل';
            let fileUrl = value;
            if (value.startsWith('user-uploads/')) {
                fileUrl = `/media/${value}`;
            } else if (!value.startsWith('http') && !value.startsWith('/')) {
                fileUrl = `/${value}`;
            }
            return (
                <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1 text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-100 w-fit"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Download className="h-4 w-4" />
                    {fileName}
                </a>
            );
        }
        return value;
    }
    if (Array.isArray(value)) {
        return <div className="flex flex-col gap-1">{value.map((v, i) => <div key={i}>{renderFieldValue(v)}</div>)}</div>;
    }
    if (typeof value === 'object') return JSON.stringify(value);
    
    // Use Persian value mapping for strings/booleans
    return getPersianValue(value as string | boolean);
  };

  const openQuoteDialog = (order: Order, itemId: string, existingQuote?: Quote) => {
    setSelectedOrder(order);
    if (existingQuote) {
        setEditingQuoteId(existingQuote.id);
        setQuoteForm({
            order_item: itemId,
            price: String(existingQuote.price),
            documentation_price: String(existingQuote.documentation_price),
            delivery_days: String(existingQuote.delivery_days),
            documentation_days: String(existingQuote.documentation_days),
            notes: existingQuote.notes
        });
    } else {
        setEditingQuoteId(null);
        setQuoteForm({
            order_item: itemId,
            price: '',
            documentation_price: '',
            delivery_days: '',
            documentation_days: '',
            notes: ''
        });
    }
    setIsQuoteDialogOpen(true);
  };

  const handleDeleteQuote = async (quoteId: string) => {
      if(!confirm('آیا از حذف این پیشنهاد اطمینان دارید؟')) return;
      try {
          const res = await fetch(getApiUrl(`/api/v1/quotes/${quoteId}/`), {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
          });
          if(res.ok) {
              fetchQuotes();
              fetchOrders(); // To update status
          }
      } catch(e) { console.error(e); }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        order_item: quoteForm.order_item,
        price: parseFloat(quoteForm.price),
        delivery_days: parseInt(quoteForm.delivery_days),
        notes: quoteForm.notes,
        documentation_price: quoteForm.documentation_price ? parseFloat(quoteForm.documentation_price) : 0,
        documentation_days: quoteForm.documentation_days ? parseInt(quoteForm.documentation_days) : 0,
      };

      let url = '/api/v1/contractor/proposals/create/';
      let method = 'POST';

      if (editingQuoteId) {
          url = `/api/v1/quotes/${editingQuoteId}/`;
          method = 'PATCH';
      }

      const response = await fetch(getApiUrl(url), {
          method: method,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'خطا در ثبت پیشنهاد');
      }

      setIsQuoteDialogOpen(false);
      fetchQuotes();
      fetchOrders(); // To update UI state
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getExistingQuote = (itemId: string) => quotes.find(q => q.order_item.id === itemId);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">پنل پیشنهادات</h1>
              <p className="text-gray-600">مشاهده سفارشات و ارسال پیشنهاد قیمت</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">سفارشات جدید ({orders.length})</TabsTrigger>
              <TabsTrigger value="my_quotes">پیشنهادات من ({quotes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4 mt-4">
              {orders.length === 0 && <div className="text-center py-10 text-gray-500">سفارش جدیدی موجود نیست</div>}
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gray-50/50 pb-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-gray-800">#{order.order_number}</span>
                            <Badge variant="outline">{new Date(order.created_at).toLocaleDateString('fa-IR')}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => toggleOrderDetails(order.id)}>
                            {expandedOrders.has(order.id) ? <ChevronUp /> : <ChevronDown />}
                            {expandedOrders.has(order.id) ? 'بستن جزئیات' : 'مشاهده جزئیات'}
                        </Button>
                    </div>
                  </CardHeader>
                  
                  {expandedOrders.has(order.id) && (
                      <CardContent className="pt-4">
                          {/* Order Files / Documentation Options */}
                          {(order.documentation_options && Object.entries(order.documentation_options).some(([_, v]) => v)) ? (
                              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                  <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                      <FileText className="h-4 w-4" /> مستندات درخواستی:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                      {Object.entries(order.documentation_options).map(([k, v]) => v && (
                                          <Badge key={k} variant="secondary" className="bg-white text-blue-700">{getPersianLabel(k)}</Badge>
                                      ))}
                                  </div>
                              </div>
                          ) : (
                              <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                                  <p className="text-sm text-gray-500">بدون مستندات درخواستی</p>
                              </div>
                          )}

                          <div className="space-y-4">
                              {order.items.map((item, idx) => {
                                  const existingQuote = getExistingQuote(item.id);
                                  return (
                                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                                          <div className="flex justify-between items-start mb-4">
                                              <div>
                                                  <div className="flex items-center gap-2 mb-1">
                                                      <Badge className="bg-gray-800">آیتم {idx + 1}</Badge>
                                                      <h3 className="font-bold text-lg">{item.service?.name}</h3>
                                                  </div>
                                                  <p className="text-gray-500 text-sm">{item.service?.description}</p>
                                              </div>
                                              {existingQuote ? (
                                                  <div className="flex items-center gap-2">
                                                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">پیشنهاد ارسال شده</Badge>
                                                      <Button size="icon" variant="ghost" onClick={() => openQuoteDialog(order, item.id, existingQuote)}>
                                                          <Edit className="h-4 w-4 text-blue-600" />
                                                      </Button>
                                                      <Button size="icon" variant="ghost" onClick={() => handleDeleteQuote(existingQuote.id)}>
                                                          <Trash2 className="h-4 w-4 text-red-600" />
                                                      </Button>
                                                  </div>
                                              ) : (
                                                  <Button onClick={() => openQuoteDialog(order, item.id)}>
                                                      <Plus className="h-4 w-4 ml-2" /> ارسال پیشنهاد
                                                  </Button>
                                              )}
                                          </div>

                                          <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                              <h4 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                                                  <Settings className="h-4 w-4" /> مشخصات فنی:
                                              </h4>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                                  {Object.entries(item.field_values).map(([key, value]) => (
                                                      <div key={key} className="flex flex-col border-b border-gray-200 pb-2 last:border-0">
                                                          <span className="text-xs text-gray-500 mb-1">{getPersianLabel(key)}</span>
                                                          <span className="text-sm font-medium">{renderFieldValue(value)}</span>
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </CardContent>
                  )}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="my_quotes">
                 {/* Similar structure for My Quotes listing, reusing components */}
                 <div className="space-y-4 mt-4">
                     {quotes.map((quote) => (
                         <Card key={quote.id}>
                             <CardHeader>
                                 <div className="flex justify-between">
                                     <CardTitle>{quote.order_item.service.name}</CardTitle>
                                     <Badge variant={quote.status === 'accepted' ? 'default' : 'secondary'}>
                                         {quote.status === 'accepted' ? 'تایید شده' : 'در انتظار'}
                                     </Badge>
                                 </div>
                                 <CardDescription>برای سفارش #{quote.order_item.order.order_number}</CardDescription>
                             </CardHeader>
                             <CardContent>
                                 <div className="flex justify-between items-center">
                                     <div>
                                         <p className="font-bold">{quote.price.toLocaleString()} تومان</p>
                                         <p className="text-sm text-gray-500">{quote.delivery_days} روز کاری</p>
                                     </div>
                                     <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openQuoteDialog({ id: quote.order_item.order.id } as any, quote.order_item.id, quote)}>
                                            <Edit className="h-4 w-4 ml-2" /> ویرایش
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteQuote(quote.id)}>
                                            <Trash2 className="h-4 w-4 ml-2" /> حذف
                                        </Button>
                                     </div>
                                 </div>
                             </CardContent>
                         </Card>
                     ))}
                 </div>
            </TabsContent>
          </Tabs>

          {/* Quote Dialog */}
          <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingQuoteId ? 'ویرایش پیشنهاد' : 'ارسال پیشنهاد جدید'}</DialogTitle>
                <DialogDescription>
                  لطفاً قیمت و زمان تحویل خود را برای این آیتم وارد کنید.
                </DialogDescription>
              </DialogHeader>

              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4"/><AlertDescription>{error}</AlertDescription></Alert>}

              <form onSubmit={handleCreateQuote} className="space-y-4 py-4">
                  <PriceInput 
                      label="قیمت پیشنهادی (تومان)" 
                      value={quoteForm.price} 
                      onChange={(val) => setQuoteForm(prev => ({...prev, price: val}))} 
                      required
                  />
                  
                  <div className="space-y-2">
                      <Label>زمان تحویل (روز)</Label>
                      <Input 
                          type="number" 
                          value={quoteForm.delivery_days} 
                          onChange={(e) => setQuoteForm(prev => ({...prev, delivery_days: e.target.value}))}
                          required
                      />
                  </div>

                  {/* Show Documentation fields if needed */}
                  {selectedOrder?.items.find(i => i.id === quoteForm.order_item)?.needs_documentation && (
                      <div className="border-t pt-4 mt-2">
                          <p className="text-sm font-medium mb-2 text-gray-700">بخش مستندات (درخواستی مشتری)</p>
                          <div className="grid grid-cols-2 gap-4">
                              <PriceInput 
                                  label="هزینه مستندات" 
                                  value={quoteForm.documentation_price} 
                                  onChange={(val) => setQuoteForm(prev => ({...prev, documentation_price: val}))} 
                              />
                              <div className="space-y-2">
                                  <Label>زمان مستندات (روز)</Label>
                                  <Input 
                                      type="number" 
                                      value={quoteForm.documentation_days} 
                                      onChange={(e) => setQuoteForm(prev => ({...prev, documentation_days: e.target.value}))}
                                  />
                              </div>
                          </div>
                      </div>
                  )}

                  <div className="space-y-2">
                      <Label>توضیحات / یادداشت</Label>
                      <Textarea 
                          value={quoteForm.notes} 
                          onChange={(e) => setQuoteForm(prev => ({...prev, notes: e.target.value}))}
                          placeholder="توضیحات تکمیلی..."
                      />
                  </div>

                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>انصراف</Button>
                      <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'در حال ثبت...' : (editingQuoteId ? 'بروزرسانی' : 'ارسال پیشنهاد')}
                      </Button>
                  </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </div>
  );
};

export default ContractorQuotes;
