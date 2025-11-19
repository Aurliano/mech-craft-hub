import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, Star, UserPlus, AlertCircle, Building
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useGetPublicJobSeekers, useCreateJobSeekerHireRequest } from '@/hooks/useWorkforce';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const JobMarket = () => {
  const { isAuthenticated, isContractor } = useAuth();
  const { toast } = useToast();
  const [selectedJobSeeker, setSelectedJobSeeker] = useState<string | null>(null);
  const [hireMessage, setHireMessage] = useState('');
  const [showHireDialog, setShowHireDialog] = useState(false);
  
  // Fetch job seekers with retry and proper error handling
  const { data: jobSeekers, isLoading: isLoadingJobSeekers, isError: isErrorJobSeekers, refetch } = useGetPublicJobSeekers();
  const createHireRequestMutation = useCreateJobSeekerHireRequest();
  
  // Retry fetching if failed
  useEffect(() => {
    if (isErrorJobSeekers) {
      const timer = setTimeout(() => {
        refetch();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isErrorJobSeekers, refetch]);
  
  type JobSeekerType = {
    id: string; job_title: string; experience_years: number; education?: string;
    is_active?: boolean; is_available?: boolean; skills?: string[];
    service_scope?: { id: string; name: string; display_name?: string };
    services?: Array<{ id: string; name: string }>;
    cv_text?: string;
    created_at?: string;
  };
  
  const availableWorkers: JobSeekerType[] = Array.isArray(jobSeekers) 
    ? jobSeekers 
    : [];
  
  // Only show available job seekers
  const activeWorkers = availableWorkers.filter(
    (worker) => worker.is_active !== false && worker.is_available !== false
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50" dir="rtl">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              بازار کار مکاترونیک
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              پل ارتباطی بین نیروهای متخصص و کارگاه‌های صنعتی
            </p>
            {!isAuthenticated && (
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    ثبت نام رایگان
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-white text-black hover:bg-white hover:text-blue-600">
                    ورود
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-green-600" />
                    نیروهای متخصص در دسترس
                  </CardTitle>
                  <CardDescription>
                    نیروهای حرفه‌ای آماده همکاری با کارگاه‌ها و شرکت‌های صنعتی
                  </CardDescription>
                </CardHeader>
              </Card>

              {isLoadingJobSeekers ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
                    <p className="text-gray-500 text-lg">
                      در حال بارگذاری...
                    </p>
                  </CardContent>
                </Card>
              ) : isErrorJobSeekers ? (
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
              ) : activeWorkers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-lg">
                      در حال حاضر نیروی متخصصی ثبت‌نام نکرده است
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeWorkers.map((worker) => (
                    <Card key={worker.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-xl">
                                {worker.job_title}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs">
                                ID: {worker.id.slice(0, 8)}...
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary">
                                {worker.experience_years} سال تجربه
                              </Badge>
                              {worker.education && (
                                <Badge variant="outline">
                                  {worker.education === 'diploma' && 'دیپلم'}
                                  {worker.education === 'associate' && 'کاردانی'}
                                  {worker.education === 'bachelor' && 'کارشناسی'}
                                  {worker.education === 'master' && 'کارشناسی ارشد'}
                                  {worker.education === 'phd' && 'دکترا'}
                                </Badge>
                              )}
                              {worker.service_scope && (
                                <Badge variant="outline">
                                  {worker.service_scope.display_name || worker.service_scope.name}
                                </Badge>
                              )}
                              {worker.is_available && (
                                <Badge className="bg-green-500">در دسترس</Badge>
                              )}
                            </div>
                          </div>
                          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        {worker.skills && worker.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {worker.skills.slice(0, 4).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                            {worker.skills.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{worker.skills.length - 4} بیشتر
                              </Badge>
                            )}
                          </div>
                        )}
                        {isAuthenticated && isContractor ? (
                          <Button 
                            variant="default" 
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleHireRequest(worker.id)}
                            disabled={createHireRequestMutation.isPending}
                          >
                            <UserPlus className="w-4 h-4 ml-2" />
                            درخواست جذب نیرو
                          </Button>
                        ) : !isAuthenticated ? (
                          <Link to="/contractor-register">
                            <Button variant="default" className="w-full bg-green-600 hover:bg-green-700">
                              ثبت‌نام کارگاه و جذب نیرو
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" className="w-full" disabled>
                            فقط پیمانکاران می‌توانند درخواست جذب نیرو ثبت کنند
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show if not authenticated */}
      {!isAuthenticated && (
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              آماده شروع هستید؟
            </h2>
            <p className="text-xl mb-8 text-indigo-100">
              ثبت‌نام کنید و از خدمات ما استفاده کنید
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/job-seeker/register">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  <Users className="w-5 h-5 ml-2" />
                  ثبت‌نام به عنوان نیروی متخصص
                </Button>
              </Link>
              <Link to="/contractor-register">
                <Button size="lg" variant="outline" className="text-lg px-8 border-white text-black hover:bg-white hover:text-indigo-600">
                  <Building className="w-5 h-5 ml-2" />
                  ثبت‌نام کارگاه
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

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
          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default JobMarket;
