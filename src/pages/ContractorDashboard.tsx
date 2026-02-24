import React, { useState } from 'react';
import { getApiUrl } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, Search, Filter, Eye, Clock, DollarSign, FileText, CheckCircle, 
  User, Star, TrendingUp, Settings, Plus, MessageSquare, Calendar,
  Factory, AlertCircle, CheckCircle2, XCircle, Timer, Users, Briefcase, UserPlus, Bell,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useCreateQuote, useGetQuotesByOrder,
  useContractorOrders, useContractorProposals, useContractorActiveProjects,
  useContractorStats, useCreateContractorProposal, useContractorWorkshops,
  useCreateContractorWorkshop, useCheckContractorManufacturingService
} from '@/hooks/useAuth';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';
import PriceInput from '@/components/PriceInput';
import { getPersianLabel, getPersianValue } from '@/lib/persianMapping';
import { normalizeFilePaths, renderFileFieldValue } from '@/lib/fieldDisplay';
import { CAPABILITIES_WITH_MACHINES } from '@/data/capabilitiesAndMachines';

const ContractorDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<{ id: string; order_number: string; items?: { id: string; needs_documentation?: boolean; field_values: any }[] } | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Quote form state
  const [quoteData, setQuoteData] = useState({
    order_item: '', // Added order_item to state
    price: '',
    documentation_price: '',
    delivery_days: '',
    documentation_days: '',
    notes: ''
  });

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  const openQuoteDialog = (order: { id: string; order_number: string; items?: any[] }, itemId: string, existingQuote?: any) => {
    setSelectedOrder(order as any);
    if (existingQuote) {
        setEditingQuoteId(existingQuote.id);
        setQuoteData({
            order_item: itemId,
            price: String(existingQuote.price),
            documentation_price: String(existingQuote.documentation_price || 0),
            delivery_days: String(existingQuote.delivery_days),
            documentation_days: String(existingQuote.documentation_days || 0),
            notes: existingQuote.notes || ''
        });
    } else {
        setEditingQuoteId(null);
        setQuoteData({
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
              // Invalidate queries or refetch
              window.location.reload(); // Simple reload for now, or better: useQueryClient to invalidate
          }
      } catch(e) { console.error(e); }
  };


  // Improved Render Field Value with Download Links - supports multiple files
  const renderFieldValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return 'تعریف نشده';
    if (typeof value === 'boolean') return value ? 'بله' : 'خیر';

    // Handle file fields (single or multiple) - show all files with download links
    const filePaths = normalizeFilePaths(value);
    if (filePaths.length > 0) {
      return (
        <div onClick={(e) => e.stopPropagation()}>
          {renderFileFieldValue(value)}
        </div>
      );
    }

    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      return <div className="flex flex-col gap-1">{value.map((v, i) => <div key={i}>{renderFieldValue(v)}</div>)}</div>;
    }
    if (typeof value === 'object') return JSON.stringify(value);

    return getPersianValue(value as string | boolean);
  };

  
  // API Hooks
  const { data: contractorOrders, isLoading: isLoadingOrders } = useContractorOrders();
  const { data: contractorProposals, isLoading: isLoadingProposals } = useContractorProposals();
  const { data: activeProjects, isLoading: isLoadingProjects } = useContractorActiveProjects();
  const { data: contractorStats, isLoading: isLoadingStats } = useContractorStats();
  const { data: workshops, isLoading: isLoadingWorkshops } = useContractorWorkshops();
  const { data: manufacturingCheck } = useCheckContractorManufacturingService();
  
  const createProposalMutation = useCreateContractorProposal();
  const createWorkshopMutation = useCreateContractorWorkshop();
  
  const isLoadingDashboard = isLoadingOrders || isLoadingProposals || isLoadingProjects || isLoadingStats || isLoadingWorkshops;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-7xl mx-auto space-y-6">
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

  // Filter orders that need quotes (pending status)
  type OrderType = { 
      id: string; 
      order_number: string; 
      notes?: string; 
      status: string; 
      created_at: string; 
      items?: Array<{ id: string; service?: { name: string; description?: string }; field_values: any; needs_documentation?: boolean }>;
      documentation_options?: Record<string, boolean>;
  };
  type ProposalType = { id: string; order_item?: { order?: { order_number: string } }; status: string; price?: number; created_at: string };
  type ProjectType = { id: string; title: string; order_number: string; days_left: number };
  type WorkshopType = { id: string; name: string; address: string; description?: string; is_active?: boolean };
  
  const orders: OrderType[] = Array.isArray(contractorOrders) ? contractorOrders as OrderType[] : [];
  const proposals: ProposalType[] = Array.isArray(contractorProposals) ? contractorProposals as ProposalType[] : [];
  const projects: ProjectType[] = Array.isArray(activeProjects) ? activeProjects as ProjectType[] : [];
  const workshopsData = Array.isArray(workshops) ? workshops : [];
  const tabItems = [
    { value: 'orders', label: 'سفارشات', icon: Package },
    { value: 'proposals', label: 'پیشنهادات من', icon: FileText },
    { value: 'projects', label: 'پروژه‌های فعال', icon: Briefcase },
    { value: 'workshops', label: 'کارگاه‌های من', icon: Factory },
    { value: 'workforce', label: 'جذب نیرو', icon: Users },
    { value: 'notifications', label: 'اعلان‌ها', icon: Bell },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'در انتظار تایید', variant: 'secondary' as const, icon: Clock },
      'accepted': { label: 'تایید شده', variant: 'default' as const, icon: CheckCircle2 },
      'rejected': { label: 'رد شده', variant: 'destructive' as const, icon: XCircle },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const, icon: Clock };
    const Icon = statusInfo.icon;
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const handleCreateQuote = async () => {
    // Basic validation
    if (!quoteData.price || !quoteData.delivery_days) {
      alert('لطفاً قیمت و زمان تحویل را وارد کنید.');
      return;
    }

    try {
      const payload: any = {
        order_item: quoteData.order_item || selectedOrder?.items?.[0]?.id || selectedOrder?.id,
        price: parseFloat(quoteData.price),
        documentation_price: parseFloat(quoteData.documentation_price) || 0,
        delivery_days: parseInt(quoteData.delivery_days),
        documentation_days: parseInt(quoteData.documentation_days) || 0,
        notes: quoteData.notes
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
          throw new Error('خطا در ثبت پیشنهاد');
      }

      setIsQuoteDialogOpen(false);
      setSelectedOrder(null);
      setEditingQuoteId(null);
      setQuoteData({
        order_item: '',
        price: '',
        documentation_price: '',
        delivery_days: '',
        documentation_days: '',
        notes: ''
      });
      
      // Refresh data (ideally use react-query invalidation)
      window.location.reload();

    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('خطا در ثبت پیشنهاد');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header - Account Section */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">خوش آمدید، {user?.first_name || user?.username}</h1>
                    <p className="text-gray-600 text-sm sm:text-base">پیمانکار</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4">
                  <Link to="/contractor/quotes">
                    <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm">
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">پیشنهادات</span>
                      <span className="sm:hidden">پیشنهادات</span>
                    </Button>
                  </Link>
                  <Link to="/contractor/projects">
                    <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">پروژه‌های من</span>
                      <span className="sm:hidden">پروژه‌ها</span>
                    </Button>
                  </Link>
                  <Link to="/contractor/ratings">
                    <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">امتیازات</span>
                      <span className="sm:hidden">امتیازات</span>
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm">
                      <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">ویرایش حساب کاربری</span>
                      <span className="sm:hidden">ویرایش</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">تعداد پیشنهادات</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{(contractorStats as { total_proposals?: number })?.total_proposals || 0}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">پیشنهادات پذیرفته شده</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{(contractorStats as { accepted_proposals?: number })?.accepted_proposals || 0}</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">پروژه‌های فعال</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">{(contractorStats as { active_projects?: number })?.active_projects || 0}</p>
                  </div>
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <div className="space-y-3">
              <div className="-mx-4 px-4 sm:hidden">
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted-foreground/30">
                  {tabItems.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;
                    return (
                      <button
                        key={tab.value}
                        onClick={() => handleTabChange(tab.value)}
                        className={cn(
                          "min-w-[110px] flex flex-col items-center justify-center rounded-2xl border px-4 py-3 text-xs transition-all duration-200",
                          isActive
                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-border bg-white text-gray-600 hover:border-primary/40"
                        )}
                      >
                        <Icon className={cn("h-5 w-5 mb-1", isActive ? "text-primary" : "text-gray-500")} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <TabsList className="hidden sm:grid w-full grid-cols-3 lg:grid-cols-6 gap-1 rounded-2xl bg-muted/60 p-1">
                {tabItems.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>سفارشات موجود برای پیشنهاد</CardTitle>
                  <CardDescription>سفارشاتی که می‌توانید برای آن‌ها پیشنهاد ثبت کنید</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
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
                    <div className="w-full sm:w-48">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="فیلتر وضعیت" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                          <SelectItem value="pending">در انتظار پیشنهاد</SelectItem>
                          <SelectItem value="submitted">ارسال شده</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

              <div className="space-y-4">
                {filteredOrders.map((order) => (
                      <Card key={order.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{order.order_number}</h3>
                            <Badge variant="outline" className="w-fit">در انتظار پیشنهاد</Badge>
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>تاریخ: {new Date(order.created_at).toLocaleDateString('fa-IR')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>تعداد آیتم: {order.items?.length || 0}</span>
                            </div>
                            {order.notes && (
                              <p className="text-gray-700 mt-2 text-xs sm:text-sm">{order.notes}</p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => {
                                // For 'available' orders in dashboard, we usually propose for the first item or handle multi-item differently.
                                // Here we assume single item or first item for simplicity in the main list view, 
                                // or better: open dialog and let them pick item if multiple? 
                                // Actually the dashboard list shows orders. We should probably open for the first item if exists.
                                const itemId = order.items?.[0]?.id || order.id; // Fallback
                                openQuoteDialog(order, itemId);
                              }}
                            >
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                              ثبت پیشنهاد
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full sm:w-auto"
                                onClick={() => toggleOrderDetails(order.id)}
                            >
                              {expandedOrders.has(order.id) ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 ml-2" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />}
                              {expandedOrders.has(order.id) ? 'بستن جزئیات' : 'مشاهده جزئیات'}
                            </Button>
                          </div>

                          {expandedOrders.has(order.id) && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                  {/* Order Files / Documentation Options */}
                                  {(order.documentation_options && Object.entries(order.documentation_options).some(([_, v]) => v)) ? (
                                      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                          <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-sm">
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
                                          <p className="text-xs text-gray-500">بدون مستندات درخواستی</p>
                                      </div>
                                  )}

                                  <div className="space-y-4">
                                      {order.items?.map((item, idx) => (
                                          <div key={item.id} className="bg-gray-50 p-4 rounded border border-gray-100">
                                              <div className="flex items-center gap-2 mb-3">
                                                  <Badge className="bg-gray-800">آیتم {idx + 1}</Badge>
                                                  <h3 className="font-bold text-sm sm:text-base">{item.service?.name}</h3>
                                              </div>
                                              <h4 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                                                  <Settings className="h-4 w-4" /> مشخصات فنی:
                                              </h4>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                                  {item.field_values && Object.entries(item.field_values).map(([key, value]) => {
                                                      // نمایش ویژه برای فرآیندهای ساخت
                                                      if (key === 'manufacturing_processes') {
                                                          const ids = Array.isArray(value) ? value : [value];
                                                          const processes = ids
                                                            .filter((v): v is string => typeof v === 'string')
                                                            .map((id) => {
                                                              const cap = CAPABILITIES_WITH_MACHINES.find(c => c.id === id);
                                                              return cap?.name || id;
                                                            })
                                                            .filter(Boolean);

                                                          if (processes.length === 0) return null;

                                                          return (
                                                            <div key={key} className="flex flex-col border-b border-gray-200 pb-2 last:border-0">
                                                              <span className="text-xs text-gray-500 mb-1">
                                                                فرآیندهای ساخت انتخاب‌شده
                                                              </span>
                                                              <div className="flex flex-wrap gap-2">
                                                                {processes.map((name) => (
                                                                  <Badge key={name} variant="secondary" className="px-2 py-0.5 text-xs">
                                                                    {name}
                                                                  </Badge>
                                                                ))}
                                                              </div>
                                                            </div>
                                                          );
                                                      }

                                                      return (
                                                        <div key={key} className="flex flex-col border-b border-gray-200 pb-2 last:border-0">
                                                            <span className="text-xs text-gray-500 mb-1">{getPersianLabel(key)}</span>
                                                            <span className="text-sm font-medium break-words">{renderFieldValue(value)}</span>
                                                        </div>
                                                      );
                                                  })}
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Proposals Tab */}
            <TabsContent value="proposals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>پیشنهادات من</CardTitle>
                  <CardDescription>پیشنهاداتی که برای سفارشات مختلف ثبت کرده‌اید</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {proposals.map((proposal: ProposalType) => (
                      <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{(proposal.order_item as { order?: { order_number: string } })?.order?.order_number || 'نامشخص'}</h3>
                            {getStatusBadge(proposal.status)}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                            <div>
                              <p className="text-gray-600">قیمت پیشنهادی</p>
                              <p className="font-semibold">{proposal.price?.toLocaleString('fa-IR')} تومان</p>
                            </div>
                            <div>
                              <p className="text-gray-600">تاریخ ثبت</p>
                              <p className="font-semibold">{new Date(proposal.created_at).toLocaleDateString('fa-IR')}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2 lg:col-span-1">
                              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                                مشاهده
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full sm:w-auto"
                                onClick={() => {
                                    // Try to find the full order object from contractorOrders
                                    const fullOrder = orders.find(o => o.order_number === proposal.order_item?.order?.order_number);
                                    if (fullOrder) {
                                        // Need to find the specific item ID
                                        const itemId = proposal.order_item?.id; // This comes from quote.order_item.id (QuoteSerializer)
                                        // But QuoteSerializer returns structure { id, service: {}, order: {} } for order_item.
                                        // We need to match this ID with items in fullOrder.
                                        // Wait, QuoteSerializer's order_item.id IS the item ID.
                                        if (itemId) {
                                            openQuoteDialog(fullOrder, String(itemId), proposal);
                                        } else {
                                            alert('اطلاعات آیتم سفارش یافت نشد.');
                                        }
                                    } else {
                                        alert('اطلاعات کامل سفارش یافت نشد (ممکن است سفارش بسته شده باشد).');
                                    }
                                }}
                              >
                                <Settings className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                                ویرایش
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="w-full sm:w-auto"
                                onClick={() => handleDeleteQuote(proposal.id)}
                              >
                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                                حذف
                              </Button>
                              {proposal.status === 'accepted' && (
                                <Button variant="default" size="sm" className="w-full sm:w-auto">
                                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                                  ارتباط با مشتری
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                ))}
              </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Active Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>پروژه‌های فعال</CardTitle>
                  <CardDescription>پروژه‌هایی که پیشنهاد شما تایید شده و در حال انجام است</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{project.title}</h3>
                            <Badge variant="default" className="w-fit">فعال</Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                            <div>
                              <p className="text-gray-600">شماره سفارش</p>
                              <p className="font-semibold">{project.order_number}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">ددلاین باقی‌مانده</p>
                              <p className="font-semibold flex items-center gap-1">
                                <Timer className="h-3 w-3 sm:h-4 sm:w-4" />
                                {project.days_left} روز
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2 lg:col-span-1">
                              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                                ارتباط با مشتری
                              </Button>
                              <Button variant="default" size="sm" className="w-full sm:w-auto">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                                مشاهده جزئیات
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
            </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Workshops Tab */}
            <TabsContent value="workshops" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                    <div>
                      <CardTitle>کارگاه‌های من</CardTitle>
                      <CardDescription>مدیریت کارگاه‌های شما</CardDescription>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                      <Link to="/my-workshops">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                        مدیریت کارگاه‌ها
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workshopsData.map((workshop: WorkshopType) => (
                      <Card key={workshop.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{workshop.name}</h3>
                            <Badge variant="default" className="w-fit">{workshop.is_active ? 'فعال' : 'غیرفعال'}</Badge>
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Factory className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{workshop.address}</span>
                            </div>
                            {workshop.description && (
                              <p className="text-gray-700">{workshop.description}</p>
                            )}
                          </div>
                          <div className="mt-4 flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              <Settings className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                              ویرایش
                            </Button>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                              مشاهده
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                  <CardTitle>اعلان‌ها</CardTitle>
                  <CardDescription>آخرین اعلان‌ها و پیام‌های سیستم</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm sm:text-base">پیشنهاد شما تایید شد</p>
                        <p className="text-xs sm:text-sm text-gray-600">سفارش ORD-2024-002 تایید شد و به پروژه‌های فعال اضافه شد</p>
                      </div>
                      <span className="text-xs text-gray-500 self-start sm:self-center">2 ساعت پیش</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm sm:text-base">پروژه تکمیل شد</p>
                        <p className="text-xs sm:text-sm text-gray-600">پروژه طراحی سیستم مکانیکی با موفقیت تکمیل شد</p>
                      </div>
                      <span className="text-xs text-gray-500 self-start sm:self-center">1 روز پیش</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Workforce Tab */}
            <TabsContent value="workforce" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-purple-600" />
                    جذب نیروی متخصص
                  </CardTitle>
                  <CardDescription>
                    درخواست نیروی کار مورد نیاز خود را ثبت کنید
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">چگونه کار می‌کند؟</h4>
                      <ul className="space-y-2 text-sm text-purple-800">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span>اطلاعات نیروی مورد نیاز را مشخص کنید</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span>تیم پشتیبانی درخواست شما را بررسی می‌کند</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span>نیروهای متخصص مطابق با نیاز شما پیدا می‌شوند</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span>نیرو برای تست ارسال می‌شود و قرارداد امضا می‌شود</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                        <Link to="/contractor/workforce/request">
                          <Plus className="w-4 h-4 ml-2" />
                          ثبت درخواست نیرو
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/job-market">
                          <Users className="w-4 h-4 ml-2" />
                          مشاهده نیروهای در دسترس
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quote Form Modal */}
          {isQuoteDialogOpen && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>{editingQuoteId ? 'ویرایش پیشنهاد' : `ثبت پیشنهاد برای سفارش ${selectedOrder.order_number}`}</CardTitle>
                    <CardDescription>لطفا جزئیات پیشنهاد خود را وارد کنید</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PriceInput
                          label="قیمت پیشنهادی (تومان)"
                          value={quoteData.price}
                          onChange={(val) => setQuoteData({...quoteData, price: val})}
                          required
                        />
                      <div>
                        <Label htmlFor="delivery_days">زمان تحویل (روز)</Label>
                        <Input
                          id="delivery_days"
                          type="number"
                          value={quoteData.delivery_days}
                          onChange={(e) => setQuoteData({...quoteData, delivery_days: e.target.value})}
                          placeholder="تعداد روز"
                        />
                      </div>
                    </div>
                    
                    {/* Conditional Documentation Fields */}
                    {selectedOrder.items?.[0]?.needs_documentation && (
                        <div className="border-t pt-4 mt-2">
                            <p className="text-sm font-medium mb-2 text-gray-700">بخش مستندات (درخواستی مشتری)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <PriceInput
                                    label="هزینه مستندات"
                          value={quoteData.documentation_price}
                                    onChange={(val) => setQuoteData({...quoteData, documentation_price: val})}
                        />
                      <div>
                                    <Label htmlFor="documentation_days">زمان مستندات (روز)</Label>
                        <Input
                          id="documentation_days"
                          type="number"
                          value={quoteData.documentation_days}
                          onChange={(e) => setQuoteData({...quoteData, documentation_days: e.target.value})}
                          placeholder="تعداد روز"
                        />
                      </div>
                    </div>
                        </div>
                    )}
                    
                    <div>
                      <Label htmlFor="notes">یادداشت</Label>
                      <Textarea
                        id="notes"
                        value={quoteData.notes}
                        onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})}
                        placeholder="توضیحات اضافی..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={handleCreateQuote}
                        disabled={createProposalMutation.isPending}
                        className="flex-1"
                      >
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                        {createProposalMutation.isPending ? 'در حال ثبت...' : 'ثبت پیشنهاد'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setIsQuoteDialogOpen(false);
                          setSelectedOrder(null);
                        }}
                        className="w-full sm:w-auto"
                      >
                        انصراف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContractorDashboard;
