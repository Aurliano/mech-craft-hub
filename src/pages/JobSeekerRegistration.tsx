import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, AlertCircle, CheckCircle, Trash2, Eye } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCreateJobSeekerProfile, useDeleteJobSeekerProfile, useGetJobSeekerProfile, useUpdateJobSeekerProfile } from '@/hooks/useWorkforce';
import { useAuth } from '@/contexts/AuthContext';
import { useScopes } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { searchSkills, getSkillsForScope, type Skill } from '@/data/skills';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

type JobSeekerProfile = {
  id: string;
  job_title?: string;
  experience_years?: number;
  education?: string;
  cv_text?: string;
  service_scope?: { id: string; name: string; display_name?: string };
  services?: Array<{ id: string; name: string }>;
  skills?: string[];
  is_active?: boolean;
  is_available?: boolean;
  created_at?: string;
};

const initialFormState = {
  job_title: '',
  experience_years: '',
  education: '',
  cv_text: '',
  service_scope: '',
  services: [] as string[],
  skills: [] as string[],
  address: '',
  phone_alt: '',
  emergency_contact: '',
  emergency_phone: '',
};

const JobSeekerRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: scopes } = useScopes();
  const { data: myProfile, refetch } = useGetJobSeekerProfile();
  const createMutation = useCreateJobSeekerProfile();
  const updateMutation = useUpdateJobSeekerProfile();
  const deleteMutation = useDeleteJobSeekerProfile();
  
  const [formData, setFormData] = useState(initialFormState);
  const [currentSkill, setCurrentSkill] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  const profileData = myProfile as { results?: JobSeekerProfile[] } | undefined;
  const existingProfile = profileData?.results?.[0];
  const hasProfile = Boolean(existingProfile);
  const [skillSuggestions, setSkillSuggestions] = useState<Skill[]>([]);

  useEffect(() => {
    if (existingProfile && !hasInitialized) {
      setFormData({
        job_title: existingProfile.job_title || '',
        experience_years: existingProfile.experience_years !== undefined ? String(existingProfile.experience_years) : '',
        education: existingProfile.education || '',
        cv_text: existingProfile.cv_text || '',
        service_scope: existingProfile.service_scope?.id || '',
        services: existingProfile.services?.map(service => service.id) || [],
        skills: existingProfile.skills || [],
        address: '',
        phone_alt: '',
        emergency_contact: '',
        emergency_phone: '',
      });
      setHasInitialized(true);
    }

    if (!existingProfile && hasInitialized) {
      setFormData(initialFormState);
      setHasInitialized(false);
    }
  }, [existingProfile, hasInitialized]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Skill autocomplete - filter by selected scope
  useEffect(() => {
    if (currentSkill.trim()) {
      let suggestions: Skill[] = [];
      
      if (formData.service_scope) {
        // Get selected scope
        const selectedScope = (scopes as Array<{ id: string; name: string; display_name?: string }>)?.find(
          scope => scope.id === formData.service_scope
        );
        
        if (selectedScope) {
          // Search in selected scope
          const scopeName = selectedScope.display_name || selectedScope.name;
          const scopeSkills = getSkillsForScope(scopeName);
          const filtered = scopeSkills.filter(skill =>
            skill.name.toLowerCase().includes(currentSkill.toLowerCase()) &&
            !formData.skills.includes(skill.name)
          );
          if (filtered.length > 0) {
            suggestions = filtered;
          } else {
            suggestions = searchSkills(currentSkill);
          }
        }
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
  }, [currentSkill, formData.skills, formData.service_scope, scopes]);

  const handleAddSkill = (skillName?: string) => {
    const skillToAdd = skillName || currentSkill.trim();
    if (
      skillToAdd &&
      !formData.skills.includes(skillToAdd) &&
      formData.skills.length < 10
    ) {
      setFormData(prev => ({ 
        ...prev, 
        skills: [...prev.skills, skillToAdd] 
      }));
      setCurrentSkill('');
      setSkillSuggestions([]);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({ 
      ...prev, 
      skills: prev.skills.filter(s => s !== skill) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const profileData = myProfile as { results?: Array<{ id: string }> } | undefined;
      if (profileData?.results?.[0]) {
        // Update existing profile
        await updateMutation.mutateAsync({
          profileId: profileData.results[0].id,
          data: {
            job_title: formData.job_title,
            experience_years: parseInt(formData.experience_years),
            education: formData.education,
            cv_text: formData.cv_text,
            service_scope: formData.service_scope || null,
            services: formData.services,
            skills: formData.skills,
          }
        });
        toast({
          title: "موفقیت",
          description: "پروفایل شما با موفقیت به‌روزرسانی شد",
        });
      } else {
        // Create new profile
        await createMutation.mutateAsync({
          job_title: formData.job_title,
          experience_years: parseInt(formData.experience_years),
          education: formData.education,
          cv_text: formData.cv_text,
          service_scope: formData.service_scope || undefined,
          services: formData.services,
          skills: formData.skills,
        });
        toast({
          title: "موفقیت",
          description: "پروفایل کاریابی شما با موفقیت ثبت شد",
        });
      }
      await refetch();
      setHasInitialized(false);
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطایی در ثبت اطلاعات رخ داد",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProfile = async () => {
    if (!existingProfile?.id) return;
    const confirmed = window.confirm('آیا از حذف پروفایل کاریابی خود مطمئن هستید؟');
    if (!confirmed) return;
    
    try {
      await deleteMutation.mutateAsync(existingProfile.id);
      await refetch();
      setFormData(initialFormState);
      setHasInitialized(false);
      toast({
        title: "موفقیت",
        description: "پروفایل کاریابی شما با موفقیت حذف شد",
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "در حذف پروفایل مشکلی رخ داد",
        variant: "destructive",
      });
    }
  };

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        {hasProfile && existingProfile && (
          <Card className="mb-6 border-green-500 bg-green-50/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
                پروفایل کاریابی شما ثبت شده است
              </CardTitle>
              <CardDescription>
                می‌توانید اطلاعات ثبت شده را مشاهده، ویرایش یا حذف کنید.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">عنوان شغلی</p>
                  <p className="font-medium">{existingProfile.job_title || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">سابقه کاری</p>
                  <p className="font-medium">
                    {existingProfile.experience_years !== undefined ? `${existingProfile.experience_years} سال` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تحصیلات</p>
                  <p className="font-medium">{existingProfile.education || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">حوزه کاری</p>
                  <p className="font-medium">
                    {existingProfile.service_scope?.display_name || existingProfile.service_scope?.name || '-'}
                  </p>
                </div>
              </div>
              
              {existingProfile.services && existingProfile.services.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">خدمات انتخاب شده</p>
                  <div className="flex flex-wrap gap-2">
                    {existingProfile.services.map((service) => (
                      <Badge key={service.id} variant="secondary">
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {existingProfile.skills && existingProfile.skills.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">مهارت‌ها</p>
                  <div className="flex flex-wrap gap-2">
                    {existingProfile.skills.map((skill, idx) => (
                      <Badge key={idx}>{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  type="button" 
                  variant="default" 
                  onClick={handleScrollToForm}
                  className="flex-1 sm:flex-none"
                >
                  <Eye className="h-4 w-4 ml-2" />
                  ویرایش اطلاعات
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteProfile}
                  disabled={deleteMutation.isPending}
                  className="flex-1 sm:flex-none"
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف پروفایل
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-8 h-8 text-blue-600" />
              ثبت‌نام کاریابی
            </CardTitle>
            <CardDescription>
              اطلاعات خود را تکمیل کنید تا در لیست نیروهای متخصص قرار بگیرید
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {(() => {
              if (hasProfile) return null;
              return (
                <Alert className="mb-6 border-blue-300 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    هنوز پروفایل کاریابی ثبت نکرده‌اید. لطفاً فرم زیر را تکمیل کنید تا در لیست نیروهای متخصص قرار بگیرید.
                  </AlertDescription>
                </Alert>
              );
            })()}
            
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
              <div>
                <Label htmlFor="job_title">عنوان شغل *</Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => handleInputChange('job_title', e.target.value)}
                  placeholder="مثال: تراشکار، برنامه‌نویس، مهندس مکانیک"
                  required
                />
              </div>

              {/* Experience */}
              <div>
                <Label htmlFor="experience">سابقه کاری *</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => handleInputChange('experience_years', e.target.value)}
                  placeholder="چه مدت سابقه کار در حوزه‌های مشابه را دارید؟"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  چه مدت سابقه کار در حوزه‌های مشابه را دارید؟
                </p>
              </div>

              {/* Education */}
              <div>
                <Label htmlFor="education">مدرک تحصیلی *</Label>
                <Select
                  value={formData.education}
                  onValueChange={(value) => handleInputChange('education', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_degree">بدون مدرک</SelectItem>
                    <SelectItem value="diploma">دیپلم</SelectItem>
                    <SelectItem value="associate">کاردانی</SelectItem>
                    <SelectItem value="bachelor">کارشناسی</SelectItem>
                    <SelectItem value="master">کارشناسی ارشد</SelectItem>
                    <SelectItem value="phd">دکترا</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Service Scope */}
              {scopes && (
                <div>
                  <Label htmlFor="service_scope">حوزه کاری</Label>
                  <Select
                    value={formData.service_scope}
                    onValueChange={(value) => handleInputChange('service_scope', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب حوزه کاری (اختیاری)" />
                    </SelectTrigger>
                    <SelectContent>
                      {(scopes as { id: string; name: string; display_name?: string }[]).map((scope: { id: string; name: string; display_name?: string }) => {
                        const scopeDisplayName = scope.display_name || scope.name;
                        return (
                          <SelectItem key={scope.id} value={scope.id}>
                            {scopeDisplayName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* CV Text */}
              <div>
                <Label htmlFor="cv_text">رزومه و مهارت‌ها *</Label>
                <Textarea
                  id="cv_text"
                  rows={8}
                  value={formData.cv_text}
                  onChange={(e) => handleInputChange('cv_text', e.target.value)}
                  placeholder="تجربیات کاری، مهارت‌ها، توانایی‌های فنی خود را در این قسمت بنویسید..."
                  required
                />
              </div>

              {/* Skills */}
              <div>
                <Label>مهارت‌های کلیدی (حداکثر 10)</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        placeholder="نام مهارت را تایپ کنید..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && currentSkill.trim() && formData.skills.length < 10) {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        disabled={formData.skills.length >= 10}
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
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-red-600 hover:text-red-800 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{formData.skills.length}/10</p>
                </div>
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

export default JobSeekerRegistration;

