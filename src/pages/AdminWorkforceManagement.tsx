import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, Briefcase, UserPlus, FileText, Eye, CheckCircle, XCircle, 
  Search, Filter, TrendingUp, AlertCircle, Calendar, Phone, Mail, MapPin
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useGetAllJobSeekers, useGetAllWorkRequests, useGetAllJobMatches, useGetAllWorkContracts,
  useCreateJobMatch, useCreateWorkContract, useUpdateJobMatch, useUpdateWorkRequest
} from '@/hooks/useWorkforce';
import { useToast } from '@/hooks/use-toast';

const AdminWorkforceManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('seekers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeeker, setSelectedSeeker] = useState<{ id: string; job_title: string } | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<{ id: string; requested_job_title: string } | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  
  const { data: jobSeekers } = useGetAllJobSeekers();
  const { data: workRequests } = useGetAllWorkRequests();
  const { data: jobMatches } = useGetAllJobMatches();
  const { data: workContracts } = useGetAllWorkContracts();
  
  const createMatchMutation = useCreateJobMatch();
  const createContractMutation = useCreateWorkContract();
  const updateMatchMutation = useUpdateJobMatch();
  const updateRequestMutation = useUpdateWorkRequest();
  
  type JobSeekerType = { 
    id: string; user: { first_name: string; last_name: string }; job_title: string; 
    experience_years: number; education: string; is_active: boolean; is_available: boolean; 
    address?: string; phone_alt?: string; cv_text?: string
  };
  type WorkRequestType = {
    id: string; requested_job_title: string; status: string; work_type?: string;
    min_experience?: number; work_location?: string; offered_salary?: number; description?: string
  };
  
  const seekers: JobSeekerType[] = Array.isArray((jobSeekers as { results?: JobSeekerType[] })?.results) 
    ? (jobSeekers as { results: JobSeekerType[] }).results 
    : [];
  const requests: WorkRequestType[] = Array.isArray((workRequests as { results?: WorkRequestType[] })?.results)
    ? (workRequests as { results: WorkRequestType[] }).results
    : [];
  
  const filteredSeekers = seekers.filter(seeker => 
    seeker.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${seeker.user.first_name} ${seeker.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateMatch = async () => {
    if (!selectedSeeker || !selectedRequest) return;
    
    try {
      await createMatchMutation.mutateAsync({
        work_request: selectedRequest.id,
        job_seeker: selectedSeeker.id,
        match_score: 85,
        match_reason: 'مطابقت تخصص با نیاز کارگاه'
      });
      toast({
        title: "موفقیت",
        description: "تطابق با موفقیت ایجاد شد",
      });
      setShowMatchDialog(false);
      setSelectedSeeker(null);
      setSelectedRequest(null);
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ایجاد تطابق",
        variant: "destructive",
      });
    }
  };
  
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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">مدیریت نیروی کار</h1>
          <p className="text-muted-foreground">مدیریت نیروهای متخصص، درخواست‌ها و تطابق‌ها</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="seekers">
              <Users className="w-4 h-4 ml-2" />
              نیروهای کاریاب ({seekers.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              <Briefcase className="w-4 h-4 ml-2" />
              درخواست‌ها ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="matches">
              <FileText className="w-4 h-4 ml-2" />
              تطابق‌ها
            </TabsTrigger>
            <TabsTrigger value="contracts">
              <CheckCircle className="w-4 h-4 ml-2" />
              قراردادها
            </TabsTrigger>
          </TabsList>

          {/* Job Seekers Tab */}
          <TabsContent value="seekers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>نیروهای کاریاب</CardTitle>
                    <CardDescription>لیست تمام نیروهای متخصص ثبت‌نام شده</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="جستجو..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSeekers.map((seeker) => (
                    <Card key={seeker.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {seeker.user.first_name} {seeker.user.last_name}
                              </h3>
                              <Badge variant={seeker.is_active && seeker.is_available ? 'default' : 'secondary'}>
                                {seeker.is_active && seeker.is_available ? 'در دسترس' : 'غیرفعال'}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p><span className="font-medium">عنوان شغل:</span> {seeker.job_title}</p>
                              <p><span className="font-medium">تجربه:</span> {seeker.experience_years} سال</p>
                              <p><span className="font-medium">تحصیلات:</span> {seeker.education}</p>
                              {seeker.address && (
                                <p className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {seeker.address}
                                </p>
                              )}
                              {seeker.phone_alt && (
                                <p className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {seeker.phone_alt}
                                </p>
                              )}
                              {seeker.cv_text && (
                                <p className="text-gray-500 truncate">{seeker.cv_text}</p>
                              )}
                            </div>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 ml-2" />
                                مشاهده کامل
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>جزئیات کامل نیرو</DialogTitle>
                                <DialogDescription>
                                  اطلاعات کامل نیروی کاریاب
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>نام و نام خانوادگی</Label>
                                    <p className="font-medium">{seeker.user.first_name} {seeker.user.last_name}</p>
                                  </div>
                                  <div>
                                    <Label>عنوان شغل</Label>
                                    <p className="font-medium">{seeker.job_title}</p>
                                  </div>
                                  <div>
                                    <Label>سال‌های تجربه</Label>
                                    <p className="font-medium">{seeker.experience_years} سال</p>
                                  </div>
                                  <div>
                                    <Label>تحصیلات</Label>
                                    <p className="font-medium">{seeker.education}</p>
                                  </div>
                                  {seeker.address && (
                                    <div>
                                      <Label>آدرس</Label>
                                      <p className="font-medium">{seeker.address}</p>
                                    </div>
                                  )}
                                  {seeker.phone_alt && (
                                    <div>
                                      <Label>تلفن</Label>
                                      <p className="font-medium">{seeker.phone_alt}</p>
                                    </div>
                                  )}
                                </div>
                                {seeker.cv_text && (
                                  <div>
                                    <Label>رزومه</Label>
                                    <p className="text-sm mt-1">{seeker.cv_text}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>درخواست‌های نیروی کار</CardTitle>
                <CardDescription>درخواست‌های کارگاه‌ها برای جذب نیرو</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{request.requested_job_title}</h3>
                              <Badge variant={
                                request.status === 'approved' ? 'default' : 
                                request.status === 'pending' ? 'secondary' : 
                                'outline'
                              }>
                                {request.status === 'approved' && 'تایید شده'}
                                {request.status === 'pending' && 'در انتظار'}
                                {request.status === 'rejected' && 'رد شده'}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              {request.work_location && (
                                <p className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {request.work_location}
                                </p>
                              )}
                              {request.offered_salary && (
                                <p>حقوق: {request.offered_salary.toLocaleString()} تومان</p>
                              )}
                              {request.work_type && (
                                <p>نوع کار: {request.work_type === 'full_time' ? 'تمام وقت' : request.work_type === 'part_time' ? 'پاره وقت' : request.work_type}</p>
                              )}
                              {request.min_experience && (
                                <p>حداقل تجربه: {request.min_experience} سال</p>
                              )}
                              {request.description && (
                                <p className="text-gray-500">{request.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowMatchDialog(true);
                              }}
                            >
                              ایجاد تطابق
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await updateRequestMutation.mutateAsync({
                                    requestId: request.id,
                                    data: { status: 'approved' }
                                  });
                                  toast({
                                    title: "موفقیت",
                                    description: "درخواست تایید شد",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "خطا",
                                    description: "خطا در تایید درخواست",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              تایید
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

          {/* Matches Tab */}
          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>تطابق‌های ایجاد شده</CardTitle>
                <CardDescription>تطابق بین نیروها و درخواست‌ها</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(jobMatches) && jobMatches.length > 0 ? (
                    jobMatches.map((match: { id: string; match_score: number; match_reason: string; status: string }) => (
                      <Card key={match.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2">تطابق #{match.id}</h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>نمره مطابقت: {match.match_score}%</p>
                                <p>دلیل: {match.match_reason}</p>
                                <Badge variant={
                                  match.status === 'accepted' ? 'default' : 
                                  match.status === 'proposed' ? 'secondary' : 
                                  'outline'
                                }>
                                  {match.status === 'accepted' && 'پذیرفته شده'}
                                  {match.status === 'proposed' && 'پیشنهاد شده'}
                                  {match.status === 'rejected' && 'رد شده'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">هنوز تطابقی ایجاد نشده است</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts">
            <Card>
              <CardHeader>
                <CardTitle>قراردادهای نیروی کار</CardTitle>
                <CardDescription>قراردادهای منعقد شده بین نیروها و کارگاه‌ها</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(workContracts) && workContracts.length > 0 ? (
                    workContracts.map((contract: { id: string; start_date: string; test_period_days: number; is_signed: boolean }) => (
                      <Card key={contract.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2">قرارداد #{contract.id}</h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>تاریخ شروع: {contract.start_date}</p>
                                <p>دوره آزمایشی: {contract.test_period_days} روز</p>
                                <Badge variant={contract.is_signed ? 'default' : 'secondary'}>
                                  {contract.is_signed ? 'امضا شده' : 'در انتظار امضا'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">هنوز قراردادی منعقد نشده است</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Match Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ایجاد تطابق</DialogTitle>
            <DialogDescription>
              نیروی مورد نظر برای درخواست را انتخاب کنید
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>درخواست</Label>
              <p className="font-medium">{selectedRequest?.requested_job_title}</p>
            </div>
            <div>
              <Label>نیروی کاریاب</Label>
                <Select onValueChange={(value) => {
                const seeker = seekers.find(s => s.id === value);
                setSelectedSeeker(seeker || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نیرو" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSeekers.map((seeker) => (
                    <SelectItem key={seeker.id} value={seeker.id}>
                      {seeker.user.first_name} {seeker.user.last_name} - {seeker.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
              انصراف
            </Button>
            <Button onClick={handleCreateMatch}>
              ایجاد تطابق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminWorkforceManagement;

