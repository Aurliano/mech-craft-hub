import React, { useState } from 'react';
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
  Factory, AlertCircle, CheckCircle2, XCircle, Timer, Users
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

const ContractorDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  
  // Quote form state
  const [quoteData, setQuoteData] = useState({
    price: '',
    documentation_price: '',
    delivery_days: '',
    documentation_days: '',
    notes: ''
  });
  
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
  const orders = Array.isArray(contractorOrders) ? contractorOrders : [];
  const proposals = Array.isArray(contractorProposals) ? contractorProposals : [];
  const projects = Array.isArray(activeProjects) ? activeProjects : [];
  const workshopsData = Array.isArray(workshops) ? workshops : [];

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
    if (!selectedOrder) return;

    try {
      await createProposalMutation.mutateAsync({
        order_item: selectedOrder.items[0]?.id || selectedOrder.id,
        price: parseFloat(quoteData.price),
        documentation_price: parseFloat(quoteData.documentation_price) || 0,
        delivery_days: parseInt(quoteData.delivery_days),
        documentation_days: parseInt(quoteData.documentation_days) || 0,
        notes: quoteData.notes
      });
      
      setShowQuoteForm(false);
      setSelectedOrder(null);
      setQuoteData({
        price: '',
        documentation_price: '',
        delivery_days: '',
        documentation_days: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header - Account Section */}
          <Card>
            <CardContent className="p-6">
          <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
            <div>
                    <h1 className="text-2xl font-bold text-gray-900">خوش آمدید، {user?.first_name || user?.username}</h1>
                    <p className="text-gray-600">پیمانکار</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link to="/profile">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      ویرایش حساب کاربری
                    </Button>
                  </Link>
                  <Link to="/reviews">
                    <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold">{contractorStats?.rating || 0}/5</span>
                      </div>
                      <p className="text-sm text-gray-600">امتیاز و نظرات</p>
                    </Card>
                  </Link>
            </div>
          </div>
            </CardContent>
          </Card>

          {/* Performance Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">تعداد پیشنهادات</p>
                    <p className="text-2xl font-bold text-gray-900">{contractorStats?.total_proposals || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">پیشنهادات پذیرفته شده</p>
                    <p className="text-2xl font-bold text-green-600">{contractorStats?.accepted_proposals || 0}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">پروژه‌های فعال</p>
                    <p className="text-2xl font-bold text-orange-600">{contractorStats?.active_projects || 0}</p>
                  </div>
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className={`grid w-full ${manufacturingCheck?.has_manufacturing_service ? 'grid-cols-5' : 'grid-cols-4'}`}>
              <TabsTrigger value="orders">سفارشات</TabsTrigger>
              <TabsTrigger value="proposals">پیشنهادات من</TabsTrigger>
              <TabsTrigger value="projects">پروژه‌های فعال</TabsTrigger>
              {manufacturingCheck?.has_manufacturing_service && (
                <TabsTrigger value="workshops">کارگاه‌های من</TabsTrigger>
              )}
              <TabsTrigger value="notifications">اعلان‌ها</TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>سفارشات موجود برای پیشنهاد</CardTitle>
                  <CardDescription>سفارشاتی که می‌توانید برای آن‌ها پیشنهاد ثبت کنید</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                      <SelectItem value="pending">در انتظار پیشنهاد</SelectItem>
                      <SelectItem value="submitted">ارسال شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredOrders.map((order) => (
                      <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                            <Badge variant="outline">در انتظار پیشنهاد</Badge>
                      </div>
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>تاریخ: {new Date(order.created_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>تعداد آیتم: {order.items?.length || 0}</span>
                        </div>
                        {order.notes && (
                          <p className="text-gray-700 mt-2">{order.notes}</p>
                        )}
                      </div>
                          <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                              onClick={() => {
                            setSelectedOrder(order);
                            setShowQuoteForm(true);
                          }}
                        >
                          <DollarSign className="h-4 w-4 ml-2" />
                          ثبت پیشنهاد
                        </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 ml-2" />
                              مشاهده جزئیات
                            </Button>
                          </div>
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
                    {proposals.map((proposal) => (
                      <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{proposal.order_item?.order?.order_number || 'نامشخص'}</h3>
                            {getStatusBadge(proposal.status)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">قیمت پیشنهادی</p>
                              <p className="font-semibold">{proposal.price?.toLocaleString('fa-IR')} تومان</p>
                            </div>
                            <div>
                              <p className="text-gray-600">تاریخ ثبت</p>
                              <p className="font-semibold">{new Date(proposal.created_at).toLocaleDateString('fa-IR')}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 ml-2" />
                                مشاهده
                              </Button>
                              {proposal.status === 'accepted' && (
                                <Button variant="default" size="sm">
                                  <MessageSquare className="h-4 w-4 ml-2" />
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
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                            <Badge variant="default">فعال</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">شماره سفارش</p>
                              <p className="font-semibold">{project.order_number}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">ددلاین باقی‌مانده</p>
                              <p className="font-semibold flex items-center gap-1">
                                <Timer className="h-4 w-4" />
                                {project.days_left} روز
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 ml-2" />
                                ارتباط با مشتری
                              </Button>
                              <Button variant="default" size="sm">
                                <Calendar className="h-4 w-4 ml-2" />
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
            {manufacturingCheck?.has_manufacturing_service && (
              <TabsContent value="workshops" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
            <div>
                      <CardTitle>کارگاه‌های من</CardTitle>
                      <CardDescription>مدیریت کارگاه‌های شما</CardDescription>
                    </div>
                    <Button asChild>
                      <Link to="/my-workshops">
                        <Plus className="h-4 w-4 ml-2" />
                        مدیریت کارگاه‌ها
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workshopsData.map((workshop) => (
                      <Card key={workshop.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{workshop.name}</h3>
                            <Badge variant="default">{workshop.status}</Badge>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Factory className="h-4 w-4" />
                              <span>{workshop.address}</span>
                            </div>
                            {workshop.description && (
                              <p className="text-gray-700">{workshop.description}</p>
                            )}
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 ml-2" />
                              ویرایش
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 ml-2" />
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
            )}

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                  <CardTitle>اعلان‌ها</CardTitle>
                  <CardDescription>آخرین اعلان‌ها و پیام‌های سیستم</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">پیشنهاد شما تایید شد</p>
                        <p className="text-sm text-gray-600">سفارش ORD-2024-002 تایید شد و به پروژه‌های فعال اضافه شد</p>
                      </div>
                      <span className="text-xs text-gray-500">2 ساعت پیش</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">پروژه تکمیل شد</p>
                        <p className="text-sm text-gray-600">پروژه طراحی سیستم مکانیکی با موفقیت تکمیل شد</p>
                      </div>
                      <span className="text-xs text-gray-500">1 روز پیش</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quote Form Modal */}
          {showQuoteForm && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>ثبت پیشنهاد برای سفارش {selectedOrder.order_number}</CardTitle>
                    <CardDescription>لطفا جزئیات پیشنهاد خود را وارد کنید</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">قیمت (تومان)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={quoteData.price}
                          onChange={(e) => setQuoteData({...quoteData, price: e.target.value})}
                          placeholder="قیمت پیشنهادی"
                        />
                      </div>
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="documentation_price">قیمت مستندسازی (تومان)</Label>
                        <Input
                          id="documentation_price"
                          type="number"
                          value={quoteData.documentation_price}
                          onChange={(e) => setQuoteData({...quoteData, documentation_price: e.target.value})}
                          placeholder="قیمت مستندسازی"
                        />
                      </div>
                      <div>
                        <Label htmlFor="documentation_days">زمان مستندسازی (روز)</Label>
                        <Input
                          id="documentation_days"
                          type="number"
                          value={quoteData.documentation_days}
                          onChange={(e) => setQuoteData({...quoteData, documentation_days: e.target.value})}
                          placeholder="تعداد روز"
                        />
                      </div>
                    </div>
                    
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
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCreateQuote}
                      disabled={createProposalMutation.isPending}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 ml-2" />
                      {createProposalMutation.isPending ? 'در حال ثبت...' : 'ثبت پیشنهاد'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setShowQuoteForm(false);
                          setSelectedOrder(null);
                        }}
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
    </div>
  );
};

export default ContractorDashboard;
