import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertCircle, X, Plus, Upload } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCreateSpecialistProfile, useGetSpecialistProfile, useUpdateSpecialistProfile } from '@/hooks/useSpecialist';
import { useAuth } from '@/contexts/AuthContext';
import { useScopes, useServices } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { uploadUserFile } from '@/lib/api';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { searchSkills, getSkillsForScope, type Skill } from '@/data/skills';

// Iranian provinces
const provinces = [
  'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی', 'مازندران',
  'گیلان', 'کرمان', 'خوزستان', 'سیستان و بلوچستان', 'کردستان', 'لرستان',
  'همدان', 'یزد', 'کرمانشاه', 'چهارمحال و بختیاری', 'قزوین', 'زنجان',
  'اردبیل', 'آذربایجان غربی', 'کهگیلویه و بویراحمد', 'ایلام', 'بوشهر',
  'هرمزگان', 'سمنان', 'قم', 'گلستان', 'البرز', 'خراسان شمالی', 'خراسان جنوبی'
];

const SpecialistProfileForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: scopes } = useScopes();
  const { data: services } = useServices();
  const { data: myProfile } = useGetSpecialistProfile();
  const createMutation = useCreateSpecialistProfile();
  const updateMutation = useUpdateSpecialistProfile();
  
  const [formData, setFormData] = useState({
    province: '',
    city: '',
    birth_date: '',
    birth_day: '',
    birth_month: '',
    birth_year: '',
    national_id: '',
    address: '',
    education: '',
    field_of_study: '',
    specializations: [] as string[],
    specialization_services: [] as string[],
    skills: [] as Array<{ name: string; level: string }>,
    work_experience: [] as Array<{ company: string; position: string; start_date: string; end_date: string; description: string }>,
    resume_file: '',
    description: '',
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<Skill[]>([]);
  const [expandedScopes, setExpandedScopes] = useState<Set<string>>(new Set());
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load existing profile
  useEffect(() => {
    const profileData = myProfile as { results?: Array<{
      province?: string;
      city?: string;
      birth_date?: string;
      national_id?: string;
      address?: string;
      education?: string;
      field_of_study?: string;
      specializations?: Array<{ id: string }>;
      specialization_services?: Array<{ id: string }>;
      skills?: Array<{ name: string; level: string }>;
      work_experience?: Array<{ company: string; position: string; start_date: string; end_date?: string | null; description: string }>;
      resume_file?: string;
      description?: string;
    }> } | undefined;
    
    if (profileData?.results?.[0]) {
      const profile = profileData.results[0];
      // Parse birth date
      if (profile.birth_date) {
        const date = new Date(profile.birth_date);
        const jalaliDate = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
        setFormData(prev => ({
          ...prev,
          province: profile.province || '',
          city: profile.city || '',
          birth_date: profile.birth_date,
          birth_day: String(jalaliDate.day),
          birth_month: String(jalaliDate.month),
          birth_year: String(jalaliDate.year),
          national_id: profile.national_id || '',
          address: profile.address || '',
          education: profile.education || '',
          field_of_study: profile.field_of_study || '',
          specializations: profile.specializations?.map(s => s.id) || [],
          specialization_services: profile.specialization_services?.map(s => s.id) || [],
          skills: profile.skills || [],
          work_experience: profile.work_experience || [],
          resume_file: profile.resume_file || '',
          description: profile.description || '',
        }));
      }
    }
  }, [myProfile]);

  // Skill autocomplete - filter by selected scopes
  useEffect(() => {
    if (currentSkill.trim()) {
      // Get skills based on selected scopes
      const selectedScopes = (scopes as Array<{ id: string; name: string }>)?.filter(
        scope => formData.specializations.includes(scope.id)
      ) || [];
      
      let suggestions: Skill[] = [];
      
      if (selectedScopes.length > 0) {
        // Search in selected scopes
        selectedScopes.forEach(scope => {
          // Try both name and display_name for scope matching
          const scopeName = (scope as { name?: string; display_name?: string }).display_name || scope.name;
          const scopeSkills = getSkillsForScope(scopeName);
          const filtered = scopeSkills.filter(skill =>
            skill.name.toLowerCase().includes(currentSkill.toLowerCase()) &&
            !formData.skills.some(s => s.name === skill.name)
          );
          suggestions.push(...filtered);
        });
      } else {
        // If no scope selected, search in all skills
        suggestions = searchSkills(currentSkill);
      }
      
      // Remove duplicates and limit to 10
      const uniqueSuggestions = suggestions.filter((skill, index, self) =>
        index === self.findIndex(s => s.name === skill.name)
      ).slice(0, 10);
      
      setSkillSuggestions(uniqueSuggestions);
    } else {
      setSkillSuggestions([]);
    }
  }, [currentSkill, formData.skills, formData.specializations, scopes]);

  // Convert Gregorian to Jalali (simplified)
  const gregorianToJalali = (gy: number, gm: number, gd: number) => {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = gy <= 1600 ? 0 : 979;
    let gy2 = gy > 1600 ? gy - 1600 : gy - 621;
    let days = (365 * gy2) + (Math.floor((gy2 + 3) / 4)) - (Math.floor((gy2 + 99) / 100)) + (Math.floor((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    let jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    let jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return { year: jy, month: jm, day: jd };
  };

  // Convert Jalali to Gregorian
  const jalaliToGregorian = (jy: number, jm: number, jd: number) => {
    jy += 1595;
    let days = -355668 + (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + jd;
    if (jm < 7) {
      days += (jm - 1) * 31;
    } else {
      days += ((jm - 7) * 30) + 186;
    }
    let gy = 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * Math.floor(--days / 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      gy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    let gd = days + 1;
    const sal_a = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm = 0;
    while (gm < 13 && gd > sal_a[gm]) {
      gd -= sal_a[gm];
      gm++;
    }
    return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = () => {
    if (formData.birth_day && formData.birth_month && formData.birth_year) {
      const day = parseInt(formData.birth_day);
      const month = parseInt(formData.birth_month);
      const year = parseInt(formData.birth_year);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1340 && year <= 1404) {
        const gregorianDate = jalaliToGregorian(year, month, day);
        setFormData(prev => ({ ...prev, birth_date: gregorianDate }));
      }
    }
  };

  useEffect(() => {
    handleDateChange();
  }, [formData.birth_day, formData.birth_month, formData.birth_year]);

  const handleAddSkill = (skillName?: string, level?: string) => {
    const skillToAdd = skillName || currentSkill.trim();
    if (skillToAdd && formData.skills.length < 10) {
      if (!formData.skills.some(s => s.name === skillToAdd)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, { name: skillToAdd, level: level || 'intermediate' }]
        }));
      }
      setCurrentSkill('');
      setSkillSuggestions([]);
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSkillLevelChange = (index: number, level: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? { ...skill, level } : skill)
    }));
  };

  const handleAddWorkExperience = () => {
    if (formData.work_experience.length < 10) {
      setFormData(prev => ({
        ...prev,
        work_experience: [...prev.work_experience, {
          company: '',
          position: '',
          start_date: '',
          end_date: '',
          description: ''
        }]
      }));
    }
  };

  const handleRemoveWorkExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== index)
    }));
  };

  const handleWorkExperienceChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleScopeToggle = (scopeId: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(scopeId)
        ? prev.specializations.filter(id => id !== scopeId)
        : [...prev.specializations, scopeId],
      specialization_services: prev.specialization_services.filter(serviceId => {
        const service = (services as Array<{ id: string; scope?: { id: string } }>)?.find(s => s.id === serviceId);
        return service?.scope?.id !== scopeId;
      })
    }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      specialization_services: prev.specialization_services.includes(serviceId)
        ? prev.specialization_services.filter(id => id !== serviceId)
        : [...prev.specialization_services, serviceId]
    }));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "خطا",
        description: "فقط فایل‌های PDF و DOC/DOCX مجاز هستند",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "خطا",
        description: "حجم فایل نباید بیشتر از 10 مگابایت باشد",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingResume(true);
    try {
      const result = await uploadUserFile(file);
      setFormData(prev => ({ ...prev, resume_file: result.file_path }));
      setResumeFile(file);
      toast({
        title: "موفقیت",
        description: "رزومه با موفقیت آپلود شد",
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در آپلود فایل",
        variant: "destructive",
      });
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.province || !formData.city || !formData.birth_date || !formData.national_id ||
        !formData.address || !formData.education || !formData.field_of_study) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدهای اجباری را پر کنید",
        variant: "destructive",
      });
      return;
    }

    if (formData.national_id.length !== 10 || !/^\d+$/.test(formData.national_id)) {
      toast({
        title: "خطا",
        description: "کد ملی باید 10 رقم باشد",
        variant: "destructive",
      });
      return;
    }

    if (formData.field_of_study.length > 50) {
      toast({
        title: "خطا",
        description: "رشته تحصیلی نباید بیشتر از 50 کاراکتر باشد",
        variant: "destructive",
      });
      return;
    }

    if (formData.description.length > 200) {
      toast({
        title: "خطا",
        description: "توضیحات نباید بیشتر از 200 کاراکتر باشد",
        variant: "destructive",
      });
      return;
    }

    try {
      const profileData = myProfile as { results?: Array<{ id: string }> } | undefined;
      const submitData = {
        province: formData.province,
        city: formData.city,
        address: formData.address,
        birth_date: formData.birth_date,
        national_id: formData.national_id,
        education: formData.education,
        field_of_study: formData.field_of_study,
        specializations: formData.specializations,
        specialization_services: formData.specialization_services,
        skills: formData.skills,
        work_experience: formData.work_experience.map(exp => ({
          ...exp,
          end_date: exp.end_date || null
        })),
        resume_file: formData.resume_file,
        description: formData.description,
      };

      if (profileData?.results?.[0]) {
        await updateMutation.mutateAsync({
          profileId: profileData.results[0].id,
          data: submitData,
        });
        toast({
          title: "موفقیت",
          description: "پروفایل شما با موفقیت به‌روزرسانی شد",
        });
      } else {
        await createMutation.mutateAsync(submitData);
        toast({
          title: "موفقیت",
          description: "پروفایل شما با موفقیت ثبت شد. پس از بررسی اطلاعات به شبکه همکاران متصل خواهید شد.",
        });
      }
      navigate('/specialist-dashboard');
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطایی در ثبت اطلاعات رخ داد",
        variant: "destructive",
      });
    }
  };

  // Get services for selected scopes
  const selectedScopeServices = (services as Array<{ id: string; name: string; scope?: { id: string } }>)?.filter(
    service => formData.specializations.includes(service.scope?.id || '')
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50" dir="rtl">
      <Navbar />
      
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-8 h-8 text-blue-600" />
              ثبت پروفایل کاریابی
            </CardTitle>
            <CardDescription>
              اطلاعات خود را تکمیل کنید تا در شبکه همکاران متخصص قرار بگیرید
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {(() => {
              const profileData = myProfile as { results?: Array<unknown> } | undefined;
              return profileData?.results?.[0] && (
                <Alert className="mb-6 border-green-500 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    شما قبلاً پروفایل کاریابی خود را ایجاد کرده‌اید. می‌توانید اطلاعات را به‌روزرسانی کنید.
                  </AlertDescription>
                </Alert>
              );
            })()}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">استان محل زندگی *</Label>
                  <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="استان را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">شهر *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="نام شهر"
                    required
                  />
                </div>
              </div>

              {/* Birth Date */}
              <div>
                <Label>تاریخ تولد *</Label>
                {isMobile ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="birth_day" className="text-xs">روز</Label>
                      <Select value={formData.birth_day} onValueChange={(value) => handleInputChange('birth_day', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="روز" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="birth_month" className="text-xs">ماه</Label>
                      <Select value={formData.birth_month} onValueChange={(value) => handleInputChange('birth_month', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="ماه" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <SelectItem key={month} value={String(month)}>{month}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="birth_year" className="text-xs">سال</Label>
                      <Select value={formData.birth_year} onValueChange={(value) => handleInputChange('birth_year', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="سال" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {Array.from({ length: 65 }, (_, i) => 1404 - i).map(year => (
                            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <Input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    required
                  />
                )}
              </div>

              {/* National ID */}
              <div>
                <Label htmlFor="national_id">کد ملی (10 رقم) *</Label>
                <Input
                  id="national_id"
                  value={formData.national_id}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleInputChange('national_id', value);
                  }}
                  placeholder="1234567890"
                  maxLength={10}
                  required
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">آدرس محل زندگی *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="آدرس کامل"
                  rows={3}
                  required
                />
              </div>

              {/* Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="education">تحصیلات *</Label>
                  <Select value={formData.education} onValueChange={(value) => handleInputChange('education', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diploma">دیپلم</SelectItem>
                      <SelectItem value="associate">کاردانی</SelectItem>
                      <SelectItem value="bachelor_student">دانشجو کارشناسی</SelectItem>
                      <SelectItem value="bachelor">کارشناسی</SelectItem>
                      <SelectItem value="master">کارشناسی ارشد</SelectItem>
                      <SelectItem value="phd">دکتری</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="field_of_study">رشته تحصیلی (حداکثر 50 کاراکتر) *</Label>
                  <Input
                    id="field_of_study"
                    value={formData.field_of_study}
                    onChange={(e) => handleInputChange('field_of_study', e.target.value.slice(0, 50))}
                    placeholder="مثال: مهندسی مکانیک"
                    maxLength={50}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData.field_of_study.length}/50</p>
                </div>
              </div>

              {/* Specializations */}
              <div>
                <Label>زمینه تخصصی * (در چه زمینه‌ای می‌توانید با ما همکاری داشته باشید؟)</Label>
                <div className="space-y-2 mt-2">
                  {scopes && (scopes as Array<{ id: string; name: string; display_name?: string }>).map((scope) => {
                    const scopeServices = selectedScopeServices.filter(s => s.scope?.id === scope.id);
                    const isExpanded = expandedScopes.has(scope.id);
                    const isSelected = formData.specializations.includes(scope.id);
                    const scopeDisplayName = scope.display_name || scope.name;
                    
                    return (
                      <div key={scope.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleScopeToggle(scope.id)}
                              className="w-4 h-4"
                            />
                            <Label className="font-medium">{scopeDisplayName}</Label>
                          </div>
                          {scopeServices.length > 0 && (
                            <Collapsible open={isExpanded} onOpenChange={(open) => {
                              setExpandedScopes(prev => {
                                const newSet = new Set(prev);
                                if (open) newSet.add(scope.id);
                                else newSet.delete(scope.id);
                                return newSet;
                              });
                            }}>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </Button>
                              </CollapsibleTrigger>
                            </Collapsible>
                          )}
                        </div>
                        {isSelected && scopeServices.length > 0 && (
                          <CollapsibleContent>
                            <div className="mt-2 mr-6 space-y-2">
                              {scopeServices.map((service) => (
                                <div key={service.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={formData.specialization_services.includes(service.id)}
                                    onChange={() => handleServiceToggle(service.id)}
                                    className="w-4 h-4"
                                  />
                                  <Label className="text-sm">{service.name}</Label>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label>توانمندی‌ها (حداکثر 10) *</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        placeholder="نام توانمندی را تایپ کنید..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && currentSkill.trim() && formData.skills.length < 10) {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                      />
                      {skillSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {skillSuggestions.map((skill) => (
                            <button
                              key={skill.name}
                              type="button"
                              className="w-full text-right px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                              onClick={() => handleAddSkill(skill.name)}
                            >
                              <span>{skill.name}</span>
                              {skill.category && (
                                <span className="text-xs text-gray-500">{skill.category}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleAddSkill()}
                      variant="outline"
                      disabled={formData.skills.length >= 10}
                    >
                      افزودن
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Badge variant="secondary">{skill.name}</Badge>
                        <Select value={skill.level} onValueChange={(value) => handleSkillLevelChange(index, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">مبتدی</SelectItem>
                            <SelectItem value="intermediate">متوسط</SelectItem>
                            <SelectItem value="advanced">پیشرفته</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSkill(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{formData.skills.length}/10</p>
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>سابقه کار (حداکثر 10)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddWorkExperience}
                    disabled={formData.work_experience.length >= 10}
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    افزودن سابقه کار
                  </Button>
                </div>
                <div className="space-y-4">
                  {formData.work_experience.map((exp, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">سابقه کار {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveWorkExperience(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>نام شرکت</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                              placeholder="نام شرکت"
                            />
                          </div>
                          <div>
                            <Label>عنوان شغل</Label>
                            <Input
                              value={exp.position}
                              onChange={(e) => handleWorkExperienceChange(index, 'position', e.target.value)}
                              placeholder="عنوان شغل"
                            />
                          </div>
                          <div>
                            <Label>تاریخ شروع</Label>
                            <Input
                              type="date"
                              value={exp.start_date}
                              onChange={(e) => handleWorkExperienceChange(index, 'start_date', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>تاریخ پایان (خالی برای حال حاضر)</Label>
                            <Input
                              type="date"
                              value={exp.end_date}
                              onChange={(e) => handleWorkExperienceChange(index, 'end_date', e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>توضیحات</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                            placeholder="توضیحات سابقه کار"
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{formData.work_experience.length}/10</p>
              </div>

              {/* Resume Upload */}
              <div>
                <Label htmlFor="resume">آپلود رزومه (PDF, DOC, DOCX - حداکثر 10 مگابایت)</Label>
                <div className="mt-2">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    disabled={isUploadingResume}
                  />
                  {formData.resume_file && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>رزومه آپلود شد</span>
                    </div>
                  )}
                  {isUploadingResume && (
                    <p className="text-sm text-muted-foreground mt-2">در حال آپلود...</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">توضیحات (حداکثر 200 کاراکتر)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value.slice(0, 200))}
                  placeholder="توضیحات تکمیلی"
                  rows={4}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/200</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(() => {
                  const profileData = myProfile as { results?: Array<unknown> } | undefined;
                  return createMutation.isPending || updateMutation.isPending
                    ? 'در حال ثبت...'
                    : profileData?.results?.[0]
                    ? 'به‌روزرسانی پروفایل'
                    : 'ثبت پروفایل کاریابی';
                })()}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default SpecialistProfileForm;

