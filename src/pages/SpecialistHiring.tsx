import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Search, MapPin, GraduationCap, Briefcase, 
  Star, Filter, UserPlus, CheckCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useGetPublicSpecialists, useCreateHireRequest } from '@/hooks/useSpecialist';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Iranian provinces
const provinces = [
  'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی', 'مازندران',
  'گیلان', 'کرمان', 'خوزستان', 'سیستان و بلوچستان', 'کردستان', 'لرستان',
  'همدان', 'یزد', 'کرمانشاه', 'چهارمحال و بختیاری', 'قزوین', 'زنجان',
  'اردبیل', 'آذربایجان غربی', 'کهگیلویه و بویراحمد', 'ایلام', 'بوشهر',
  'هرمزگان', 'سمنان', 'قم', 'گلستان', 'البرز', 'خراسان شمالی', 'خراسان جنوبی'
];

const SpecialistHiring = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);
  const [hireMessage, setHireMessage] = useState('');
  const [showHireDialog, setShowHireDialog] = useState(false);
  
  const { data: specialistsData, isLoading } = useGetPublicSpecialists({
    province: selectedProvince || undefined,
    city: selectedCity || undefined,
  });
  const createHireRequestMutation = useCreateHireRequest();

  type SpecialistType = {
    id: string;
    specialist_code?: string;
    province?: string;
    city?: string;
    education?: string;
    field_of_study?: string;
    specializations?: Array<{ name: string }>;
    specialization_services?: Array<{ name: string }>;
    skills?: Array<{ name: string; level: string }>;
    work_experience?: Array<{ company: string; position: string; start_date: string; end_date?: string | null }>;
    description?: string;
  };

  const specialists: SpecialistType[] = Array.isArray(specialistsData) 
    ? (specialistsData as SpecialistType[]) 
    : [];

  // Filter by search term
  const filteredSpecialists = specialists.filter(specialist => {
    const matchesSearch = !searchTerm || 
      (specialist.specialist_code?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (specialist.field_of_study?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (specialist.specializations?.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (specialist.specialization_services?.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesSearch;
  });

  const handleHireRequest = async () => {
    if (!selectedSpecialist) return;

    try {
      await createHireRequestMutation.mutateAsync({
        specialist_profile: selectedSpecialist,
        message: hireMessage,
      });
      toast({
        title: "موفقیت",
        description: "درخواست شما با موفقیت ثبت شد. ادمین با شما تماس خواهد گرفت.",
      });
      setShowHireDialog(false);
      setSelectedSpecialist(null);
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
      'bachelor_student': 'دانشجو کارشناسی',
      'bachelor': 'کارشناسی',
      'master': 'کارشناسی ارشد',
      'phd': 'دکتری',
    };
    return labels[education || ''] || education;
  };

  const getSkillLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      'beginner': 'مبتدی',
      'intermediate': 'متوسط',
      'advanced': 'پیشرفته',
    };
    return labels[level] || level;
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>جستجو</Label>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="کد، رشته، تخصص..."
                        className="pr-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>استان</Label>
                    <Select value={selectedProvince || "all"} onValueChange={(value) => setSelectedProvince(value === "all" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="همه استان‌ها" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">همه استان‌ها</SelectItem>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>شهر</Label>
                    <Input
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      placeholder="نام شهر"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedProvince('');
                        setSelectedCity('');
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

      {/* Specialists List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">در حال بارگذاری...</p>
              </div>
            ) : filteredSpecialists.length === 0 ? (
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
                {filteredSpecialists.map((specialist) => (
                  <Card key={specialist.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {specialist.specialist_code || `SP-${specialist.id.slice(0, 8)}`}
                          </CardTitle>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {specialist.province && specialist.city && (
                              <Badge variant="secondary">
                                <MapPin className="w-3 h-3 ml-1" />
                                {specialist.province}، {specialist.city}
                              </Badge>
                            )}
                            {specialist.education && (
                              <Badge variant="outline">
                                <GraduationCap className="w-3 h-3 ml-1" />
                                {getEducationLabel(specialist.education)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {specialist.field_of_study && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">رشته تحصیلی:</p>
                          <p className="font-medium">{specialist.field_of_study}</p>
                        </div>
                      )}
                      
                      {specialist.specializations && specialist.specializations.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">زمینه تخصصی:</p>
                          <div className="flex flex-wrap gap-1">
                            {specialist.specializations.slice(0, 3).map((spec, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {spec.name}
                              </Badge>
                            ))}
                            {specialist.specializations.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{specialist.specializations.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {specialist.specialization_services && specialist.specialization_services.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">خدمات تخصصی:</p>
                          <div className="flex flex-wrap gap-1">
                            {specialist.specialization_services.slice(0, 3).map((service, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {service.name}
                              </Badge>
                            ))}
                            {specialist.specialization_services.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{specialist.specialization_services.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {specialist.skills && specialist.skills.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">توانمندی‌ها:</p>
                          <div className="flex flex-wrap gap-1">
                            {specialist.skills.slice(0, 4).map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill.name} ({getSkillLevelLabel(skill.level)})
                              </Badge>
                            ))}
                            {specialist.skills.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{specialist.skills.length - 4} بیشتر
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {specialist.work_experience && specialist.work_experience.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">سابقه کار:</p>
                          <p className="text-sm">{specialist.work_experience.length} مورد ثبت شده</p>
                        </div>
                      )}

                      {specialist.description && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 line-clamp-2">{specialist.description}</p>
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
                        ) : (
                          <Dialog open={showHireDialog && selectedSpecialist === specialist.id} onOpenChange={(open) => {
                            if (!open) {
                              setShowHireDialog(false);
                              setSelectedSpecialist(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="default"
                                className="w-full"
                                onClick={() => {
                                  setSelectedSpecialist(specialist.id);
                                  setShowHireDialog(true);
                                }}
                              >
                                <UserPlus className="w-4 h-4 ml-2" />
                                درخواست جذب این نیرو
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>درخواست جذب نیروی متخصص</DialogTitle>
                                <DialogDescription>
                                  درخواست شما به ادمین ارسال می‌شود و پس از بررسی، با شما تماس گرفته خواهد شد.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>کد نیروی متخصص</Label>
                                  <Input
                                    value={specialist.specialist_code || `SP-${specialist.id.slice(0, 8)}`}
                                    disabled
                                  />
                                </div>
                                <div>
                                  <Label>پیام (اختیاری)</Label>
                                  <Textarea
                                    value={hireMessage}
                                    onChange={(e) => setHireMessage(e.target.value)}
                                    placeholder="توضیحات یا نیازمندی‌های خاص خود را بنویسید..."
                                    rows={4}
                                  />
                                </div>
                                <Button
                                  onClick={handleHireRequest}
                                  disabled={createHireRequestMutation.isPending}
                                  className="w-full"
                                >
                                  {createHireRequestMutation.isPending ? 'در حال ارسال...' : 'ارسال درخواست'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
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

      <Footer />
    </div>
  );
};

export default SpecialistHiring;

