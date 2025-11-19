import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { uploadUserFile } from '@/lib/api';
import {
  useCreateSpecialistProfile,
  useGetSpecialistProfile,
  useUpdateSpecialistProfile,
} from '@/hooks/useSpecialist';
import { useScopes, useServices } from '@/hooks/useAuth';
import iranProvinces from '@/data/provinces';
import { searchSkills, getSkillsForScope, type Skill } from '@/data/skills';
import { CheckCircle2, FileText, ShieldCheck, UploadCloud, Star, Target } from 'lucide-react';

type StepKey = 'personal' | 'cooperation';

const registrationSteps = [
  { key: 'account', label: 'ساخت حساب', status: 'done' },
  { key: 'phone', label: 'تأیید شماره همراه', status: 'done' },
  { key: 'personal', label: 'اطلاعات فردی', status: 'pending' },
  { key: 'cooperation', label: 'اطلاعات همکاری', status: 'pending' },
] as const;

const SpecialistOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: scopes } = useScopes();
  const { data: services } = useServices();
  const { data: profileData, isLoading } = useGetSpecialistProfile();
  const createMutation = useCreateSpecialistProfile();
  const updateMutation = useUpdateSpecialistProfile();

  const [currentStep, setCurrentStep] = useState<StepKey>('personal');
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<Skill[]>([]);
  const [expandedScopes, setExpandedScopes] = useState<Set<string>>(new Set());
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const [formData, setFormData] = useState({
    province: '',
    city: '',
    address: '',
    postal_code: '',
    birth_date: '',
    national_id: '',
    education: '',
    field_of_study: '',
    description: '',
    specializations: [] as string[],
    specialization_services: [] as string[],
    skills: [] as Array<{ name: string; level: 'beginner' | 'intermediate' | 'advanced' }>,
    work_experience: [] as Array<{ company: string; position: string; start_date: string; end_date: string; description: string }>,
    resume_file: '',
  });

  const profile = profileData as { results?: Array<Record<string, any>> } | undefined;
  const existingProfile = profile?.results?.[0];

  useEffect(() => {
    if (existingProfile) {
      setFormData((prev) => ({
        ...prev,
        province: existingProfile.province || '',
        city: existingProfile.city || '',
        address: existingProfile.address || '',
        postal_code: existingProfile.postal_code || '',
        birth_date: existingProfile.birth_date || '',
        national_id: existingProfile.national_id || '',
        education: existingProfile.education || '',
        field_of_study: existingProfile.field_of_study || '',
        description: existingProfile.description || '',
        specializations: existingProfile.specializations?.map((s: { id: string }) => s.id) || [],
        specialization_services: existingProfile.specialization_services?.map((s: { id: string }) => s.id) || [],
        skills: existingProfile.skills || [],
        work_experience: existingProfile.work_experience || [],
        resume_file: existingProfile.resume_file || '',
      }));
    }
  }, [existingProfile]);

  useEffect(() => {
    if (skillInput.trim()) {
      const selectedScopes = (scopes as Array<{ id: string; name: string; display_name?: string }> | undefined)?.filter(
        (scope) => formData.specializations.includes(scope.id)
      ) || [];

      let suggestions: Skill[] = [];
      if (selectedScopes.length > 0) {
        selectedScopes.forEach((scope) => {
          const scopeName = scope.display_name || scope.name;
          const scopeSkills = getSkillsForScope(scopeName);
          const filtered = scopeSkills.filter(
            (skill) =>
              skill.name.toLowerCase().includes(skillInput.toLowerCase()) &&
              !formData.skills.some((s) => s.name === skill.name)
          );
          suggestions.push(...filtered);
        });
      } else {
        suggestions = searchSkills(skillInput);
      }

      const uniqueSuggestions = suggestions.filter(
        (skill, index, self) => index === self.findIndex((s) => s.name === skill.name)
      );
      setSkillSuggestions(uniqueSuggestions.slice(0, 8));
    } else {
      setSkillSuggestions([]);
    }
  }, [skillInput, formData.skills, formData.specializations, scopes]);

  const selectedScopeServices = useMemo(() => {
    const allServices = services as Array<{ id: string; name: string; scope?: { id: string } }> | undefined;
    if (!allServices) return [];
    return allServices.filter((service) => formData.specializations.includes(service.scope?.id || ''));
  }, [services, formData.specializations]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillAdd = (name?: string) => {
    const skillName = (name || skillInput).trim();
    if (!skillName || formData.skills.length >= 10) return;
    if (formData.skills.some((skill) => skill.name === skillName)) return;
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: skillName, level: 'intermediate' }],
    }));
    setSkillInput('');
    setSkillSuggestions([]);
  };

  const handleSkillLevelChange = (index: number, level: 'beginner' | 'intermediate' | 'advanced') => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => (i === index ? { ...skill, level } : skill)),
    }));
  };

  const handleSkillRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleWorkExperienceAdd = () => {
    if (formData.work_experience.length >= 5) return;
    setFormData((prev) => ({
      ...prev,
      work_experience: [
        ...prev.work_experience,
        { company: '', position: '', start_date: '', end_date: '', description: '' },
      ],
    }));
  };

  const handleWorkExperienceChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const handleWorkExperienceRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== index),
    }));
  };

  const handleScopeToggle = (scopeId: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(scopeId)
        ? prev.specializations.filter((id) => id !== scopeId)
        : [...prev.specializations, scopeId],
      specialization_services: prev.specialization_services.filter((serviceId) => {
        const service = selectedScopeServices.find((s) => s.id === serviceId);
        return service?.scope?.id !== scopeId;
      }),
    }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      specialization_services: prev.specialization_services.includes(serviceId)
        ? prev.specialization_services.filter((id) => id !== serviceId)
        : [...prev.specialization_services, serviceId],
    }));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const extension = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!allowedTypes.includes(extension)) {
      toast({
        title: 'خطا',
        description: 'فقط فایل‌های PDF یا DOC/DOCX مجاز هستند',
        variant: 'destructive',
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'خطا',
        description: 'حجم فایل نباید بیشتر از 10 مگابایت باشد',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingResume(true);
    try {
      const result = await uploadUserFile(file);
      setFormData((prev) => ({ ...prev, resume_file: result.file_path }));
      setResumeFile(file);
      toast({
        title: 'موفقیت',
        description: 'رزومه با موفقیت بارگذاری شد',
      });
    } catch {
      toast({
        title: 'خطا',
        description: 'آپلود فایل انجام نشد. دوباره تلاش کنید.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingResume(false);
    }
  };

  const validatePersonalStep = () => {
    if (
      !formData.province ||
      !formData.city ||
      !formData.address ||
      !formData.birth_date ||
      !formData.national_id ||
      !formData.education ||
      !formData.field_of_study
    ) {
      toast({
        title: 'اطلاعات ناقص',
        description: 'همه فیلدهای اجباری را تکمیل کنید.',
        variant: 'destructive',
      });
      return false;
    }
    if (formData.national_id.length !== 10 || !/^\d+$/.test(formData.national_id)) {
      toast({
        title: 'کد ملی نامعتبر',
        description: 'کد ملی باید دقیقاً ۱۰ رقم باشد.',
        variant: 'destructive',
      });
      return false;
    }
    if (
      formData.postal_code &&
      (!/^\d+$/.test(formData.postal_code) || ![5, 10].includes(formData.postal_code.length))
    ) {
      toast({
        title: 'کد پستی نامعتبر',
        description: 'کد پستی باید ۵ یا ۱۰ رقم باشد.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateCooperationStep = () => {
    if (!formData.specializations.length) {
      toast({
        title: 'زمینه همکاری',
        description: 'حداقل یک حوزه همکاری را انتخاب کنید.',
        variant: 'destructive',
      });
      return false;
    }
    if (!formData.skills.length) {
      toast({
        title: 'توانمندی‌ها',
        description: 'حداقل یک مهارت را ثبت کنید.',
        variant: 'destructive',
      });
      return false;
    }
    if (formData.description.length > 200) {
      toast({
        title: 'توضیحات طولانی است',
        description: 'حداکثر طول توضیحات ۲۰۰ کاراکتر است.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 'personal' && validatePersonalStep()) {
      setCurrentStep('cooperation');
    }
  };

  const handlePrev = () => {
    if (currentStep === 'cooperation') {
      setCurrentStep('personal');
    }
  };

  const handleSubmit = async () => {
    if (!validateCooperationStep()) return;

    const payload = {
      province: formData.province,
      city: formData.city,
      address: formData.address,
      postal_code: formData.postal_code,
      birth_date: formData.birth_date,
      national_id: formData.national_id,
      education: formData.education,
      field_of_study: formData.field_of_study,
      description: formData.description,
      specializations: formData.specializations,
      specialization_services: formData.specialization_services,
      skills: formData.skills,
      work_experience: formData.work_experience.map((exp) => ({
        ...exp,
        end_date: exp.end_date || null,
      })),
      resume_file: formData.resume_file,
    };

    try {
      if (existingProfile) {
        await updateMutation.mutateAsync({
          profileId: existingProfile.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      toast({
        title: 'اطلاعات ثبت شد',
        description: 'پروفایل شما برای بررسی ارسال شد.',
      });
      navigate('/specialist-dashboard');
    } catch {
      toast({
        title: 'خطا',
        description: 'ذخیره اطلاعات با مشکل مواجه شد.',
        variant: 'destructive',
      });
    }
  };

  const computedSteps = registrationSteps.map((step) => {
    if (step.key === 'personal') {
      return { ...step, status: currentStep === 'personal' ? 'active' : currentStep === 'cooperation' ? 'done' : 'pending' };
    }
    if (step.key === 'cooperation') {
      return { ...step, status: currentStep === 'cooperation' ? 'active' : 'pending' };
    }
    return step;
  });

  if (isLoading && !existingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-gray-50" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">در حال آماده‌سازی فرم ثبت اطلاعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50" dir="rtl">
      <Navbar />

      <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="secondary" className="text-sm">
            فرآیند ثبت‌نام نیروی متخصص
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">تکمیل پروفایل تخصصی</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            با تکمیل این فرم چند مرحله‌ای، تیم جذب نیرو می‌تواند سریع‌تر شما را به پروژه‌های مناسب متصل کند.
            اطلاعات مرحله‌ای مصنوعی حذف شده و فقط موارد ضروری از شما پرسیده می‌شود.
          </p>
        </div>

        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-4 gap-3">
                {computedSteps.map((step, index) => (
                  <div key={step.key} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-semibold ${
                          step.status === 'done'
                            ? 'bg-green-500'
                            : step.status === 'active'
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                        }`}
                      >
                        {step.status === 'done' ? <CheckCircle2 className="w-6 h-6" /> : index + 1}
                      </div>
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        step.status === 'active' ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
              <Progress value={currentStep === 'personal' ? 50 : 90} />
            </div>
          </CardContent>
        </Card>

        {existingProfile && (
          <Alert className="border-green-500 bg-green-50">
            <AlertDescription className="text-green-800 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                اطلاعات شما قبلاً ثبت شده و اکنون در حالت ویرایش قرار دارد.
              </div>
              در صورت نیاز می‌توانید اطلاعات را به‌روزرسانی کنید. پس از ذخیره، آخرین نسخه برای تیم پشتیبانی ارسال می‌شود.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {currentStep === 'personal' ? (
                <FileText className="w-8 h-8 text-blue-600" />
              ) : (
                <Target className="w-8 h-8 text-indigo-600" />
              )}
              <div>
                <CardTitle className="text-2xl">
                  {currentStep === 'personal' ? 'مرحله سوم: اطلاعات فردی' : 'مرحله چهارم: اطلاعات همکاری'}
                </CardTitle>
                <CardDescription>
                  {currentStep === 'personal'
                    ? 'مشخصات شخصی و تحصیلی شما فقط برای تیم پشتیبانی قابل مشاهده است.'
                    : 'زمینه‌های همکاری، مهارت‌ها و تجربه کاری خود را وارد کنید.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {currentStep === 'personal' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>استان *</Label>
                    <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب استان" />
                      </SelectTrigger>
                      <SelectContent>
                        {iranProvinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>شهر *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="نام شهر"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>آدرس دقیق *</Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      placeholder="مثال: اصفهان، خیابان ..."
                    />
                  </div>
                  <div>
                    <Label>کد پستی (اختیاری)</Label>
                    <Input
                      value={formData.postal_code}
                      onChange={(e) =>
                        handleInputChange('postal_code', e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      placeholder="کد پستی ۱۰ رقمی"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>تاریخ تولد *</Label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>کد ملی *</Label>
                    <Input
                      value={formData.national_id}
                      onChange={(e) =>
                        handleInputChange('national_id', e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      placeholder="۱۰ رقم"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>آخرین مدرک تحصیلی *</Label>
                    <Select value={formData.education} onValueChange={(value) => handleInputChange('education', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب مدرک" />
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
                    <Label>رشته تحصیلی *</Label>
                    <Input
                      value={formData.field_of_study}
                      onChange={(e) => handleInputChange('field_of_study', e.target.value.slice(0, 50))}
                      placeholder="مثال: مهندسی مکانیک"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{formData.field_of_study.length}/50</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label>زمینه همکاری با ما *</Label>
                  <p className="text-sm text-muted-foreground">
                    حوزه‌هایی را که مایل به همکاری هستید انتخاب کنید. در صورت انتخاب هر حوزه، خدمات مرتبط نیز قابل انتخاب خواهند بود.
                  </p>
                  <div className="space-y-3">
                    {(scopes as Array<{ id: string; name: string; display_name?: string }> | undefined)?.map((scope) => {
                      const isSelected = formData.specializations.includes(scope.id);
                      const scopeServices = selectedScopeServices.filter((service) => service.scope?.id === scope.id);
                      const isExpanded = expandedScopes.has(scope.id);
                      const displayName = scope.display_name || scope.name;

                      return (
                        <div key={scope.id} className="border rounded-lg p-3 bg-white shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleScopeToggle(scope.id)}
                                className="w-4 h-4"
                              />
                              <p className="font-medium">{displayName}</p>
                            </div>
                            {scopeServices.length > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setExpandedScopes((prev) => {
                                    const clone = new Set(prev);
                                    if (clone.has(scope.id)) clone.delete(scope.id);
                                    else clone.add(scope.id);
                                    return clone;
                                  })
                                }
                              >
                                {isExpanded ? 'پنهان‌کردن خدمات' : 'مشاهده خدمات'} ({scopeServices.length})
                              </Button>
                            )}
                          </div>
                          {isSelected && scopeServices.length > 0 && isExpanded && (
                            <div className="grid sm:grid-cols-2 gap-2 mt-3 mr-6">
                              {scopeServices.map((service) => (
                                <label key={service.id} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={formData.specialization_services.includes(service.id)}
                                    onChange={() => handleServiceToggle(service.id)}
                                  />
                                  {service.name}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>توانمندی‌ها (حداکثر ۱۰ مورد) *</Label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="نام مهارت یا نرم‌افزار..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSkillAdd();
                          }
                        }}
                      />
                      {skillSuggestions.length > 0 && (
                        <div className="absolute z-10 bg-white border rounded-lg mt-1 w-full shadow-lg max-h-60 overflow-y-auto">
                          {skillSuggestions.map((skill) => (
                            <button
                              key={skill.name}
                              type="button"
                              className="w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center justify-between"
                              onClick={() => handleSkillAdd(skill.name)}
                            >
                              <span>{skill.name}</span>
                              {skill.category && <span className="text-xs text-gray-500">{skill.category}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button type="button" variant="outline" onClick={() => handleSkillAdd()} disabled={formData.skills.length >= 10}>
                      افزودن
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.skills.map((skill, index) => (
                      <div key={skill.name} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                        <Badge variant="secondary" className="text-base">
                          {skill.name}
                        </Badge>
                        <Select value={skill.level} onValueChange={(value) => handleSkillLevelChange(index, value as any)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">مبتدی</SelectItem>
                            <SelectItem value="intermediate">متوسط</SelectItem>
                            <SelectItem value="advanced">حرفه‌ای</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="ghost" onClick={() => handleSkillRemove(index)}>
                          حذف
                        </Button>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">{formData.skills.length}/10</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>سوابق کاری (حداکثر ۵ سابقه)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleWorkExperienceAdd}
                      disabled={formData.work_experience.length >= 5}
                    >
                      افزودن سابقه
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.work_experience.map((exp, index) => (
                      <Card key={index} className="border-dashed">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">سابقه {index + 1}</h4>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleWorkExperienceRemove(index)}>
                              حذف
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              placeholder="نام شرکت"
                              value={exp.company}
                              onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                            />
                            <Input
                              placeholder="سمت / نقش"
                              value={exp.position}
                              onChange={(e) => handleWorkExperienceChange(index, 'position', e.target.value)}
                            />
                            <Input
                              type="date"
                              value={exp.start_date}
                              onChange={(e) => handleWorkExperienceChange(index, 'start_date', e.target.value)}
                            />
                            <Input
                              type="date"
                              value={exp.end_date}
                              onChange={(e) => handleWorkExperienceChange(index, 'end_date', e.target.value)}
                            />
                          </div>
                          <Textarea
                            rows={2}
                            placeholder="توضیحات کوتاه درباره وظایف و دستاوردها"
                            value={exp.description}
                            onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>رزومه (اختیاری)</Label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={isUploadingResume} />
                    {formData.resume_file && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <UploadCloud className="w-4 h-4" />
                        فایل بارگذاری شده
                      </div>
                    )}
                    {resumeFile && <span className="text-xs text-muted-foreground">{resumeFile.name}</span>}
                  </div>
                  {isUploadingResume && <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>}
                </div>

                <div className="space-y-2">
                  <Label>توضیحات تکمیلی (حداکثر ۲۰۰ کاراکتر)</Label>
                  <Textarea
                    rows={4}
                    placeholder="مثلاً: آماده همکاری تمام‌وقت در پروژه‌های صنعتی هستم..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value.slice(0, 200))}
                  />
                  <p className="text-xs text-muted-foreground">{formData.description.length}/200</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {currentStep === 'cooperation' && (
                <Button variant="outline" className="flex-1" onClick={handlePrev}>
                  بازگشت به مرحله قبل
                </Button>
              )}
              {currentStep === 'personal' ? (
                <Button className="flex-1" onClick={handleNext}>
                  ادامه به مرحله همکاری
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'در حال ثبت...' : 'ثبت اطلاعات نهایی'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default SpecialistOnboarding;

