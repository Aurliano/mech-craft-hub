import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Search, Star, Filter, UserPlus, AlertCircle, GraduationCap
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useGetPublicJobSeekers, useCreateJobSeekerHireRequest } from '@/hooks/useWorkforce';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useScopes } from '@/hooks/useAuth';

const SpecialistHiring = () => {
  const { isAuthenticated, isContractor } = useAuth();
  const { toast } = useToast();
  const { data: scopes } = useScopes();
  const [selectedScope, setSelectedScope] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobSeeker, setSelectedJobSeeker] = useState<string | null>(null);
  const [hireMessage, setHireMessage] = useState('');
  const [showHireDialog, setShowHireDialog] = useState(false);
  
  // Fetch job seekers with scope filter
  const { data: jobSeekersData, isLoading, isError, refetch } = useGetPublicJobSeekers(
    selectedScope ? { service_scope: selectedScope } : undefined
  );
  const createHireRequestMutation = useCreateJobSeekerHireRequest();

  // Retry fetching if failed
  useEffect(() => {
    if (isError) {
      const timer = setTimeout(() => {
        refetch();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isError, refetch]);

  type JobSeekerType = {
    id: string;
    job_title: string;
    experience_years: number;
    education?: string;
    cv_text?: string;
    service_scope?: { id: string; name: string; display_name?: string };
    services?: Array<{ id: string; name: string }>;
    skills?: string[];
    is_active?: boolean;
    is_available?: boolean;
    created_at?: string;
  };

  const jobSeekers: JobSeekerType[] = Array.isArray(jobSeekersData) 
    ? jobSeekersData 
    : [];

  // Filter by search term and availability
  const filteredJobSeekers = jobSeekers.filter(seeker => {
    const isActive = seeker.is_active !== false && seeker.is_available !== false;
    if (!isActive) return false;
    
    const matchesSearch = !searchTerm || 
      (seeker.job_title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (seeker.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (seeker.service_scope?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (seeker.service_scope?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleHireRequest = (jobSeekerId: string) => {
    if (!isAuthenticated || !isContractor) {
      toast({
        title: "نیاز به ورود",
        description: "برای ثبت درخواست جذب نیرو باید به عنوان پیمانکار وارد شوید",
        variant: "destructive",
      });
      return;
    }
    setSelectedJobSeeker(jobSeekerId);
    setHireMessage('');
    setShowHireDialog(true);
  };

  const handleSubmitHireRequest = async () => {
    if (!selectedJobSeeker) return;
    
    try {
      await createHireRequestMutation.mutateAsync({
        job_seeker: selectedJobSeeker,
        message: hireMessage || undefined,
      });
      toast({
        title: "موفقیت",
        description: "درخواست جذب نیرو با موفقیت ثبت شد. این درخواست برای بررسی به مدیر سایت ارسال شد.",
      });
      setShowHireDialog(false);
      setSelectedJobSeeker(null);
      setHireMessage('');
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطایی در ثبت درخواست رخ داد",
        variant: "destructive",
      });
    }
  };

  const getEducationLabel = (education?: string) => {
    const labels: Record<string, string> = {
      'diploma': 'دیپلم',
      'associate': 'کاردانی',
      'bachelor': 'کارشناسی',
      'master': 'کارشناسی ارشد',
      'phd': 'دکترا',
    };
    return labels[education || ''] || education;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50" dir="rtl">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              جذب نیروی متخصص
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              شبکه گسترده نیروهای متخصص آماده همکاری
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>جستجو</Label>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="عنوان شغل، مهارت، حوزه کاری..."
                        className="pr-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>حوزه کاری</Label>
                    <Select value={selectedScope || "all"} onValueChange={(value) => setSelectedScope(value === "all" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="همه حوزه‌ها" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">همه حوزه‌ها</SelectItem>
                        {(scopes as Array<{ id: string; name: string; display_name?: string }>)?.map((scope) => (
                          <SelectItem key={scope.id} value={scope.id}>
                            {scope.display_name || scope.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedScope('');
                        setSearchTerm('');
                      }}
                      className="w-full"
                    >
                      <Filter className="h-4 w-4 ml-2" />
                      پاک کردن فیلترها
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Job Seekers List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">در حال بارگذاری...</p>
              </div>
            ) : isError ? (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-300" />
                  <p className="text-red-500 text-lg mb-4">
                    خطا در بارگذاری اطلاعات
                  </p>
                  <Button onClick={() => refetch()} variant="outline">
                    تلاش مجدد
                  </Button>
                </CardContent>
              </Card>
            ) : filteredJobSeekers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">
                    در حال حاضر نیروی متخصصی یافت نشد
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredJobSeekers.map((seeker) => (
                  <Card key={seeker.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">
                              {seeker.job_title}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">
                              ID: {seeker.id.slice(0, 8)}...
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary">
                              {seeker.experience_years} سال تجربه
                            </Badge>
                            {seeker.education && (
                              <Badge variant="outline">
                                <GraduationCap className="w-3 h-3 ml-1" />
                                {getEducationLabel(seeker.education)}
                              </Badge>
                            )}
                            {seeker.service_scope && (
                              <Badge variant="outline">
                                {seeker.service_scope.display_name || seeker.service_scope.name}
                              </Badge>
                            )}
                            {seeker.is_available && (
                              <Badge className="bg-green-500">در دسترس</Badge>
                            )}
                          </div>
                        </div>
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {seeker.skills && seeker.skills.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">مهارت‌ها:</p>
                          <div className="flex flex-wrap gap-1">
                            {seeker.skills.slice(0, 4).map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {seeker.skills.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{seeker.skills.length - 4} بیشتر
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {seeker.services && seeker.services.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">خدمات:</p>
                          <div className="flex flex-wrap gap-1">
                            {seeker.services.slice(0, 3).map((service) => (
                              <Badge key={service.id} variant="secondary" className="text-xs">
                                {service.name}
                              </Badge>
                            ))}
                            {seeker.services.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{seeker.services.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {seeker.cv_text && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 line-clamp-2">{seeker.cv_text}</p>
                        </div>
                      )}

                      <div className="mt-4">
                        {!isAuthenticated ? (
                          <Link to="/login">
                            <Button variant="default" className="w-full">
                              <UserPlus className="w-4 h-4 ml-2" />
                              ورود برای درخواست جذب
                            </Button>
                          </Link>
                        ) : isContractor ? (
                          <Button
                            variant="default"
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleHireRequest(seeker.id)}
                            disabled={createHireRequestMutation.isPending}
                          >
                            <UserPlus className="w-4 h-4 ml-2" />
                            درخواست جذب این نیرو
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" disabled>
                            فقط پیمانکاران می‌توانند درخواست جذب نیرو ثبت کنند
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hire Request Dialog */}
      <Dialog open={showHireDialog} onOpenChange={setShowHireDialog}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>درخواست جذب نیرو</DialogTitle>
            <DialogDescription>
              درخواست شما برای بررسی به مدیر سایت ارسال خواهد شد. نیروی متخصص از این درخواست مطلع نخواهد شد.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">پیام (اختیاری)</Label>
              <Textarea
                id="message"
                value={hireMessage}
                onChange={(e) => setHireMessage(e.target.value)}
                placeholder="در صورت نیاز، پیام یا توضیحات خود را وارد کنید..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowHireDialog(false);
                setSelectedJobSeeker(null);
                setHireMessage('');
              }}
            >
              انصراف
            </Button>
            <Button
              onClick={handleSubmitHireRequest}
              disabled={createHireRequestMutation.isPending}
            >
              {createHireRequestMutation.isPending ? 'در حال ثبت...' : 'ثبت درخواست'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SpecialistHiring;

