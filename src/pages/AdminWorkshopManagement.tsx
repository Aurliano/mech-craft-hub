import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Building2, Search, CheckCircle, XCircle, Eye, Clock, 
  MapPin, Phone, User, Calendar, Wrench, Gauge, Factory, FileText, Filter
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllWorkshopsForAdmin, approveWorkshop } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CAPABILITIES_WITH_MACHINES } from '@/data/capabilitiesAndMachines';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { getApiUrl, getAccessToken, getCSRFToken } from "@/lib/api";

type Workshop = {
  id: string;
  code?: string;
  name: string;
  address: string;
  description?: string;
  owner: {
    id: string;
    username: string;
    email?: string;
  };
  is_active: boolean;
  is_approved?: boolean;
  workshop_class?: 'A' | 'B' | 'C' | null;
  status: string;
  created_at: string;
  province?: string;
  city?: string;
  postal_address?: string;
  manager_name?: string;
  manager_phone?: string;
  workers_count?: number;
  capabilities?: string[];
  machines?: { name: string; precision?: string; quantity?: number; capability_id?: string; is_custom?: boolean }[];
  documents?: Record<string, string[]>;
};

const AdminWorkshopManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalData, setApprovalData] = useState({
    is_approved: true,
    workshop_class: '' as 'A' | 'B' | 'C' | '',
    rejection_reason: ''
  });

  // Fetch all workshops
  const { data: workshops = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-workshops'],
    queryFn: async () => {
      const data = await getAllWorkshopsForAdmin();
      return Array.isArray(data) ? (data as unknown as Workshop[]) : [];
    },
  });

  // Approve/Reject mutation
  const approveMutation = useMutation({
    mutationFn: async ({ workshopId, data }: { workshopId: string; data: { is_approved: boolean; workshop_class?: 'A' | 'B' | 'C'; rejection_reason?: string } }) => {
      return await approveWorkshop(workshopId, data);
    },
    onSuccess: () => {
      toast({
        title: "موفق",
        description: "کارگاه با موفقیت به‌روزرسانی شد",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-workshops'] });
      setShowApprovalDialog(false);
      setSelectedWorkshop(null);
    },
    onError: (error: unknown) => {
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "خطا در به‌روزرسانی کارگاه",
        variant: "destructive",
      });
    },
  });

  const isAdmin = !!user && ((((user as unknown as Record<string, unknown>)?.role) === 'admin') || ((user as unknown as { role?: { name?: string } }).role?.name === 'admin'));

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">دسترسی محدود</h2>
              <p className="text-muted-foreground">فقط مدیران می‌توانند به این صفحه دسترسی داشته باشند</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter workshops
  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = 
      workshop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.owner.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !workshop.is_approved && workshop.is_active) ||
      (filterStatus === 'approved' && workshop.is_approved) ||
      (filterStatus === 'rejected' && !workshop.is_active);

    return matchesSearch && matchesStatus;
  });

  const pendingCount = workshops.filter(w => !w.is_approved && w.is_active).length;
  const approvedCount = workshops.filter(w => w.is_approved).length;

  const handleOpenApprovalDialog = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setApprovalData({
      is_approved: workshop.is_approved || false,
      workshop_class: (workshop.workshop_class as 'A' | 'B' | 'C') || '',
      rejection_reason: ''
    });
    setShowApprovalDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedWorkshop) return;
    
    if (approvalData.is_approved && !approvalData.workshop_class) {
      toast({
        title: "خطا",
        description: "برای تایید کارگاه باید کلاس کارگاه را مشخص کنید",
        variant: "destructive",
      });
      return;
    }

    await approveMutation.mutateAsync({
      workshopId: selectedWorkshop.id,
      data: {
        is_approved: approvalData.is_approved,
        workshop_class: approvalData.workshop_class || undefined,
        rejection_reason: approvalData.rejection_reason || undefined
      }
    });
  };

  const getStatusBadge = (workshop: Workshop) => {
    if (workshop.is_approved) {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle className="h-3 w-3 ml-1" />
          تایید شده
        </Badge>
      );
    } else if (workshop.is_active) {
      return (
        <Badge className="bg-yellow-500 text-white">
          <Clock className="h-3 w-3 ml-1" />
          در انتظار تایید
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 ml-1" />
          رد شده
        </Badge>
      );
    }
  };

  const getClassBadge = (cls?: 'A' | 'B' | 'C' | null) => {
    if (!cls) return null;
    const colors = {
      'A': 'bg-yellow-500 text-white',
      'B': 'bg-blue-500 text-white',
      'C': 'bg-gray-500 text-white'
    };
    return (
      <Badge className={colors[cls]}>
        کلاس {cls}
      </Badge>
    );
  };

  const downloadPrivateFile = async (filePath: string) => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("لطفاً وارد حساب کاربری شوید");
      }
      const url = getApiUrl(`/v1/user-files/download/?path=${encodeURIComponent(filePath)}`);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRFToken': getCSRFToken() || ''
        },
        credentials: 'include'
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const dlUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = filePath.split('/').pop() || 'file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(dlUrl);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download failed:', e);
      // optional: toast error if available
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <section className="py-10">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">مدیریت کارگاه‌ها</h1>
            <p className="text-muted-foreground">تایید و مدیریت کارگاه‌های ثبت شده</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">کل کارگاه‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workshops.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">در انتظار تایید</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">تایید شده</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>فیلتر و جستجو</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search">جستجو</Label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="جستجو بر اساس نام، کد، کاربر، استان یا شهر..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status-filter">وضعیت</Label>
                  <Select value={filterStatus} onValueChange={(value: 'all' | 'pending' | 'approved' | 'rejected') => setFilterStatus(value)}>
                    <SelectTrigger id="status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه</SelectItem>
                      <SelectItem value="pending">در انتظار تایید</SelectItem>
                      <SelectItem value="approved">تایید شده</SelectItem>
                      <SelectItem value="rejected">رد شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workshops List */}
          {isLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">در حال بارگذاری کارگاه‌ها...</p>
              </CardContent>
            </Card>
          ) : filteredWorkshops.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredWorkshops.map((workshop) => (
                <Card key={workshop.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          <CardTitle className="text-xl">{workshop.name}</CardTitle>
                        </div>
                        <CardDescription className="flex items-center gap-4 flex-wrap">
                          {workshop.code && <span>کد: {workshop.code}</span>}
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            مالک: {workshop.owner.username}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(workshop.created_at).toLocaleDateString('fa-IR')}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(workshop)}
                        {getClassBadge(workshop.workshop_class)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Tabs defaultValue="info" className="w-full">
                      <TabsList>
                        <TabsTrigger value="info">اطلاعات پایه</TabsTrigger>
                        <TabsTrigger value="capabilities">توانمندی‌ها و دستگاه‌ها</TabsTrigger>
                        <TabsTrigger value="documents">مدارک</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="info" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">آدرس</Label>
                            <p className="mt-1">{workshop.address}</p>
                            {workshop.postal_address && (
                              <p className="text-sm text-muted-foreground mt-1">{workshop.postal_address}</p>
                            )}
                            {(workshop.province || workshop.city) && (
                              <p className="text-sm text-muted-foreground mt-1">
                                <MapPin className="h-4 w-4 inline ml-1" />
                                {workshop.province} - {workshop.city}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">اطلاعات تماس</Label>
                            {workshop.manager_name && (
                              <p className="mt-1">
                                <User className="h-4 w-4 inline ml-1" />
                                مسئول: {workshop.manager_name}
                              </p>
                            )}
                            {workshop.manager_phone && (
                              <p className="mt-1">
                                <Phone className="h-4 w-4 inline ml-1" />
                                {workshop.manager_phone}
                              </p>
                            )}
                            {workshop.workers_count !== undefined && (
                              <p className="mt-1">
                                <Factory className="h-4 w-4 inline ml-1" />
                                تعداد پرسنل: {workshop.workers_count} نفر
                              </p>
                            )}
                          </div>
                        </div>
                        {workshop.description && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">توضیحات</Label>
                            <p className="mt-1 text-sm">{workshop.description}</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="capabilities" className="space-y-4 mt-4">
                        {/* Capabilities */}
                        <div>
                          <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            توانمندی‌ها
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {(workshop.capabilities || []).map((capabilityId, index) => {
                              const capability = CAPABILITIES_WITH_MACHINES.find(c => c.id === capabilityId);
                              return (
                                <Badge key={index} variant="secondary">
                                  {capability ? capability.name : capabilityId}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Machines */}
                        <div>
                          <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                            <Gauge className="h-4 w-4" />
                            دستگاه‌ها
                          </Label>
                          {workshop.machines && workshop.machines.length > 0 ? (
                            <div className="space-y-2">
                              {workshop.machines.map((machine, index) => (
                                <Card key={index} className="p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{machine.name}</p>
                                      {machine.precision && (
                                        <p className="text-xs text-muted-foreground mt-1">{machine.precision}</p>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      {machine.quantity && machine.quantity > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                          {machine.quantity} عدد
                                        </Badge>
                                      )}
                                      {machine.is_custom && (
                                        <Badge variant="secondary" className="text-xs">سفارشی</Badge>
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">دستگاهی ثبت نشده است</p>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="documents" className="space-y-4 mt-4">
                        {workshop.documents && Object.keys(workshop.documents).length > 0 ? (
                          <div className="space-y-3">
                            {Object.entries(workshop.documents).map(([fieldKey, fileUrls]) => (
                              <div key={fieldKey}>
                                <Label className="text-sm font-medium mb-2 block">
                                  {fieldKey === 'workshop_license' && 'مجوز کارگاه'}
                                  {fieldKey === 'machine_certificates' && 'گواهی‌های دستگاه‌ها'}
                                  {fieldKey === 'quality_certificates' && 'گواهی‌های کیفیت'}
                                  {fieldKey === 'insurance_documents' && 'مدارک بیمه'}
                                </Label>
                                <div className="grid grid-cols-1 gap-2">
                                  {Array.isArray(fileUrls) && fileUrls.map((filePath, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => downloadPrivateFile(String(filePath))}
                                      className="text-left flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                      <FileText className="h-4 w-4" />
                                      فایل {idx + 1}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">مدرکی آپلود نشده است</p>
                        )}
                      </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-6 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenApprovalDialog(workshop)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        تایید / رد کارگاه
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">کارگاهی یافت نشد</h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all'
                    ? 'با فیلترهای فعلی کارگاهی یافت نشد'
                    : 'هنوز کارگاهی ثبت نشده است'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>تایید / رد کارگاه</DialogTitle>
            <DialogDescription>
              {selectedWorkshop && `کارگاه: ${selectedWorkshop.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="approval-status">وضعیت</Label>
              <Select
                value={approvalData.is_approved ? 'approved' : 'rejected'}
                onValueChange={(value) => setApprovalData(prev => ({
                  ...prev,
                  is_approved: value === 'approved',
                  workshop_class: value === 'approved' ? prev.workshop_class : ''
                }))}
              >
                <SelectTrigger id="approval-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">تایید کارگاه</SelectItem>
                  <SelectItem value="rejected">رد کارگاه</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {approvalData.is_approved && (
              <div>
                <Label htmlFor="workshop-class">کلاس کارگاه *</Label>
                <Select
                  value={approvalData.workshop_class}
                  onValueChange={(value: 'A' | 'B' | 'C') => setApprovalData(prev => ({ ...prev, workshop_class: value }))}
                >
                  <SelectTrigger id="workshop-class">
                    <SelectValue placeholder="کلاس کارگاه را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">کلاس A</SelectItem>
                    <SelectItem value="B">کلاس B</SelectItem>
                    <SelectItem value="C">کلاس C</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  کلاس کارگاه را بر اساس امکانات، تجهیزات و مدارک آن انتخاب کنید
                </p>
              </div>
            )}

            {!approvalData.is_approved && (
              <div>
                <Label htmlFor="rejection-reason">دلیل رد (اختیاری)</Label>
                <Textarea
                  id="rejection-reason"
                  value={approvalData.rejection_reason}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, rejection_reason: e.target.value }))}
                  placeholder="دلیل رد کارگاه را وارد کنید..."
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              انصراف
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending || (approvalData.is_approved && !approvalData.workshop_class)}
            >
              {approveMutation.isPending ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminWorkshopManagement;
