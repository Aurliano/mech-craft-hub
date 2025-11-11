import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Search, CheckCircle, XCircle, Eye, Clock, 
  MapPin, GraduationCap, Briefcase, Filter, FileText, UserPlus
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useGetAllSpecialistsForAdmin, useApproveSpecialistProfile, useGetSpecialistHireRequests } from '@/hooks/useSpecialist';
import { useToast } from '@/hooks/use-toast';

type SpecialistProfile = {
  id: string;
  specialist_code?: string;
  province?: string;
  city?: string;
  address?: string;
  birth_date?: string;
  national_id?: string;
  education?: string;
  field_of_study?: string;
  specializations?: Array<{ id: string; name: string }>;
  specialization_services?: Array<{ id: string; name: string }>;
  skills?: Array<{ name: string; level: string }>;
  work_experience?: Array<{ company: string; position: string; start_date: string; end_date?: string | null; description: string }>;
  resume_file?: string;
  description?: string;
  is_approved: boolean;
  reviewed_by?: { id: string; username: string };
  reviewed_at?: string;
  admin_notes?: string;
  user: {
    id: string;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  created_at: string;
};

type HireRequest = {
  id: string;
  requester: {
    id: string;
    username: string;
    email?: string;
  };
  specialist_profile: {
    id: string;
    specialist_code?: string;
  };
  message?: string;
  status: string;
  created_at: string;
};

const AdminSpecialistManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistProfile | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalData, setApprovalData] = useState({
    is_approved: true,
    admin_notes: ''
  });
  const [activeTab, setActiveTab] = useState('profiles');

  // Fetch specialists
  const { data: specialistsData, isLoading, refetch } = useGetAllSpecialistsForAdmin();
  const { data: hireRequestsData } = useGetSpecialistHireRequests();
  
  const approveMutation = useApproveSpecialistProfile();

  const specialists: SpecialistProfile[] = Array.isArray(specialistsData?.results) 
    ? (specialistsData.results as SpecialistProfile[])
    : Array.isArray(specialistsData)
    ? (specialistsData as SpecialistProfile[])
    : [];

  const hireRequests: HireRequest[] = Array.isArray(hireRequestsData?.results)
    ? (hireRequestsData.results as HireRequest[])
    : Array.isArray(hireRequestsData)
    ? (hireRequestsData as HireRequest[])
    : [];

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

  // Filter specialists
  const filteredSpecialists = specialists.filter(specialist => {
    const matchesSearch = 
      specialist.specialist_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialist.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialist.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialist.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialist.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialist.field_of_study?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !specialist.is_approved) ||
      (filterStatus === 'approved' && specialist.is_approved) ||
      (filterStatus === 'rejected' && !specialist.is_approved && specialist.reviewed_at);

    return matchesSearch && matchesStatus;
  });

  const pendingCount = specialists.filter(s => !s.is_approved).length;
  const approvedCount = specialists.filter(s => s.is_approved).length;

  const handleOpenApprovalDialog = (specialist: SpecialistProfile) => {
    setSelectedSpecialist(specialist);
    setApprovalData({
      is_approved: specialist.is_approved || false,
      admin_notes: specialist.admin_notes || ''
    });
    setShowApprovalDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedSpecialist) return;
    
    try {
      await approveMutation.mutateAsync({
        specialistId: selectedSpecialist.id,
        data: approvalData,
      });
      toast({
        title: "موفق",
        description: "پروفایل نیروی متخصص با موفقیت به‌روزرسانی شد",
      });
      setShowApprovalDialog(false);
      setSelectedSpecialist(null);
      refetch();
    } catch (error) {
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "خطا در به‌روزرسانی پروفایل",
        variant: "destructive",
      });
    }
  };

  const getEducationLabel = (education?: string) => {
    const labels: Record<string, string> = {
      'diploma': 'دیپلم',
      'associate': 'کاردانی',
      'bachelor_student': 'دانشجو کارشناسی',
      'bachelor': 'کارشناسی',
      'master': 'کارشناسی ارشد',
      'phd': 'دکتری',
    };
    return labels[education || ''] || education;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">بررسی شبکه همکار</h1>
            <p className="text-gray-600">مدیریت و بررسی پروفایل‌های نیروی متخصص و درخواست‌های جذب نیرو</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">در انتظار بررسی</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">تایید شده</p>
                    <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">درخواست‌های جذب</p>
                    <p className="text-2xl font-bold text-blue-600">{hireRequests.length}</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="profiles">پروفایل‌های نیروی متخصص</TabsTrigger>
              <TabsTrigger value="requests">درخواست‌های جذب نیرو</TabsTrigger>
            </TabsList>

            {/* Profiles Tab */}
            <TabsContent value="profiles">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>پروفایل‌های نیروی متخصص</CardTitle>
                      <CardDescription>بررسی و تایید/رد پروفایل‌ها</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="جستجو..."
                          className="pr-10 w-full md:w-64"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={(value: 'all' | 'pending' | 'approved' | 'rejected') => setFilterStatus(value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">همه</SelectItem>
                          <SelectItem value="pending">در انتظار</SelectItem>
                          <SelectItem value="approved">تایید شده</SelectItem>
                          <SelectItem value="rejected">رد شده</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">در حال بارگذاری...</p>
                    </div>
                  ) : filteredSpecialists.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">پروفایلی یافت نشد</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredSpecialists.map((specialist) => (
                        <Card key={specialist.id} className={specialist.is_approved ? 'border-green-500' : 'border-yellow-500'}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CardTitle className="text-xl">
                                    {specialist.specialist_code || `SP-${specialist.id.slice(0, 8)}`}
                                  </CardTitle>
                                  <Badge variant={specialist.is_approved ? "default" : "secondary"}>
                                    {specialist.is_approved ? 'تایید شده' : 'در انتظار تایید'}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                  {specialist.user.first_name && specialist.user.last_name && (
                                    <span>{specialist.user.first_name} {specialist.user.last_name}</span>
                                  )}
                                  {specialist.province && specialist.city && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {specialist.province}، {specialist.city}
                                    </span>
                                  )}
                                  {specialist.education && (
                                    <span className="flex items-center gap-1">
                                      <GraduationCap className="h-3 w-3" />
                                      {getEducationLabel(specialist.education)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenApprovalDialog(specialist)}
                              >
                                <Eye className="h-4 w-4 ml-2" />
                                بررسی
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">ایمیل:</p>
                                <p className="font-medium">{specialist.user.email || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">شماره تلفن:</p>
                                <p className="font-medium">{specialist.user.phone || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">رشته تحصیلی:</p>
                                <p className="font-medium">{specialist.field_of_study || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">زمینه تخصصی:</p>
                                <p className="font-medium">
                                  {specialist.specializations?.map(s => s.name).join(', ') || '-'}
                                </p>
                              </div>
                              {specialist.reviewed_by && (
                                <div>
                                  <p className="text-gray-600">بررسی شده توسط:</p>
                                  <p className="font-medium">{specialist.reviewed_by.username}</p>
                                </div>
                              )}
                              {specialist.reviewed_at && (
                                <div>
                                  <p className="text-gray-600">تاریخ بررسی:</p>
                                  <p className="font-medium">{new Date(specialist.reviewed_at).toLocaleDateString('fa-IR')}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hire Requests Tab */}
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>درخواست‌های جذب نیرو</CardTitle>
                  <CardDescription>درخواست‌های پیمانکاران و کارگاه‌ها برای جذب نیروی متخصص</CardDescription>
                </CardHeader>
                <CardContent>
                  {hireRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">درخواستی یافت نشد</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hireRequests.map((request) => (
                        <Card key={request.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">
                                  درخواست برای {request.specialist_profile.specialist_code || `SP-${request.specialist_profile.id.slice(0, 8)}`}
                                </CardTitle>
                                <CardDescription>
                                  درخواست کننده: {request.requester.username} ({request.requester.email})
                                </CardDescription>
                              </div>
                              <Badge variant={request.status === 'pending' ? "secondary" : "default"}>
                                {request.status === 'pending' && 'در انتظار'}
                                {request.status === 'approved' && 'تایید شده'}
                                {request.status === 'rejected' && 'رد شده'}
                                {request.status === 'contacted' && 'تماس برقرار شده'}
                                {request.status === 'completed' && 'تکمیل شده'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {request.message && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">پیام:</p>
                                <p className="text-sm">{request.message}</p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500">
                              تاریخ درخواست: {new Date(request.created_at).toLocaleDateString('fa-IR')}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>بررسی پروفایل نیروی متخصص</DialogTitle>
            <DialogDescription>
              {selectedSpecialist?.specialist_code || `SP-${selectedSpecialist?.id.slice(0, 8)}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSpecialist && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>نام و نام خانوادگی</Label>
                  <p className="font-medium">
                    {selectedSpecialist.user.first_name} {selectedSpecialist.user.last_name}
                  </p>
                </div>
                <div>
                  <Label>کد ملی</Label>
                  <p className="font-medium">{selectedSpecialist.national_id}</p>
                </div>
                <div>
                  <Label>ایمیل</Label>
                  <p className="font-medium">{selectedSpecialist.user.email}</p>
                </div>
                <div>
                  <Label>شماره تلفن</Label>
                  <p className="font-medium">{selectedSpecialist.user.phone}</p>
                </div>
                <div>
                  <Label>استان</Label>
                  <p className="font-medium">{selectedSpecialist.province}</p>
                </div>
                <div>
                  <Label>شهر</Label>
                  <p className="font-medium">{selectedSpecialist.city}</p>
                </div>
                <div>
                  <Label>آدرس</Label>
                  <p className="font-medium">{selectedSpecialist.address}</p>
                </div>
                <div>
                  <Label>تاریخ تولد</Label>
                  <p className="font-medium">
                    {selectedSpecialist.birth_date ? new Date(selectedSpecialist.birth_date).toLocaleDateString('fa-IR') : '-'}
                  </p>
                </div>
                <div>
                  <Label>تحصیلات</Label>
                  <p className="font-medium">{getEducationLabel(selectedSpecialist.education)}</p>
                </div>
                <div>
                  <Label>رشته تحصیلی</Label>
                  <p className="font-medium">{selectedSpecialist.field_of_study}</p>
                </div>
              </div>

              {selectedSpecialist.specializations && selectedSpecialist.specializations.length > 0 && (
                <div>
                  <Label>زمینه تخصصی</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSpecialist.specializations.map((spec) => (
                      <Badge key={spec.id}>{spec.name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedSpecialist.skills && selectedSpecialist.skills.length > 0 && (
                <div>
                  <Label>توانمندی‌ها</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSpecialist.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline">
                        {skill.name} ({skill.level === 'beginner' ? 'مبتدی' : skill.level === 'intermediate' ? 'متوسط' : 'پیشرفته'})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedSpecialist.description && (
                <div>
                  <Label>توضیحات</Label>
                  <p className="text-sm mt-2">{selectedSpecialist.description}</p>
                </div>
              )}

              <div>
                <Label>وضعیت</Label>
                <Select
                  value={approvalData.is_approved ? 'approved' : 'rejected'}
                  onValueChange={(value) => setApprovalData(prev => ({ ...prev, is_approved: value === 'approved' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">تایید</SelectItem>
                    <SelectItem value="rejected">رد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>یادداشت ادمین</Label>
                <Textarea
                  value={approvalData.admin_notes}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, admin_notes: e.target.value }))}
                  placeholder="یادداشت‌های خود را اینجا بنویسید..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              انصراف
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              variant={approvalData.is_approved ? "default" : "destructive"}
            >
              {approveMutation.isPending ? 'در حال ثبت...' : approvalData.is_approved ? 'تایید' : 'رد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminSpecialistManagement;

