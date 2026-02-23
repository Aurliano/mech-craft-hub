import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Calendar, Shield, Key, Bell, Camera, Save, Edit, FileText, Building2, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { api, getApiUrl } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, isLoadingDashboard } = useAuth();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    organization: (user as unknown as Record<string, unknown>)?.organization as string || '',
  });
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const profileImage = (user as unknown as Record<string, unknown>)?.profile_image as string | undefined;
  const resumeFile = (user as unknown as Record<string, unknown>)?.resume_file as string | undefined;

  useEffect(() => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      organization: (user as unknown as Record<string, unknown>)?.organization as string || '',
    });
  }, [user]);

  const invalidateMe = () => queryClient.invalidateQueries({ queryKey: ['me'] });

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await api.updateMyProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        organization: formData.organization,
      });
      invalidateMe();
      toast({ title: 'ذخیره شد', description: 'تغییرات پروفایل ذخیره شد.' });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast({ title: 'خطا', description: 'ذخیره تغییرات انجام نشد.', variant: 'destructive' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      organization: (user as unknown as Record<string, unknown>)?.organization as string || '',
    });
    setIsEditing(false);
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    setAvatarLoading(true);
    try {
      await api.uploadUserAvatar(file);
      invalidateMe();
      toast({ title: 'آواتار به‌روز شد' });
    } catch (err) {
      toast({ title: 'خطا', description: 'آپلود آواتار انجام نشد.', variant: 'destructive' });
    } finally {
      setAvatarLoading(false);
    }
  };

  const onDeleteAvatar = async () => {
    setAvatarLoading(true);
    try {
      await api.deleteUserAvatar();
      invalidateMe();
      toast({ title: 'آواتار حذف شد' });
    } catch (err) {
      toast({ title: 'خطا', variant: 'destructive' });
    } finally {
      setAvatarLoading(false);
    }
  };

  const onResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setResumeLoading(true);
    try {
      await api.uploadUserResume(file);
      invalidateMe();
      toast({ title: 'رزومه به‌روز شد' });
    } catch (err) {
      toast({ title: 'خطا', description: 'آپلود رزومه انجام نشد.', variant: 'destructive' });
    } finally {
      setResumeLoading(false);
    }
  };

  const onDeleteResume = async () => {
    setResumeLoading(true);
    try {
      await api.deleteUserResume();
      invalidateMe();
      toast({ title: 'رزومه حذف شد' });
    } catch (err) {
      toast({ title: 'خطا', variant: 'destructive' });
    } finally {
      setResumeLoading(false);
    }
  };

  const resumeDownloadUrl = resumeFile ? getApiUrl('/v1/user-files/download/') + '?path=' + encodeURIComponent(resumeFile) : null;

  // Fields that might not exist on BasicUser type
  const createdAt = (user as unknown as Record<string, unknown>)?.created_at as string | undefined;
  const isEmailVerified = (user as unknown as Record<string, unknown>)?.is_email_verified as boolean | undefined;
  const isPhoneVerified = (user as unknown as Record<string, unknown>)?.is_phone_verified as boolean | undefined;

  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">پروفایل من</h1>
            <p className="text-gray-600">مدیریت اطلاعات شخصی و تنظیمات حساب</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 ml-2" />
              ویرایش پروفایل
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                انصراف
              </Button>
              <Button onClick={handleSave} disabled={saveLoading}>
                <Save className="h-4 w-4 ml-2" />
                {saveLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">اطلاعات شخصی</TabsTrigger>
            <TabsTrigger value="security">امنیت</TabsTrigger>
            <TabsTrigger value="notifications">اعلان‌ها</TabsTrigger>
            <TabsTrigger value="preferences">تنظیمات</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  اطلاعات شخصی
                </CardTitle>
                <CardDescription>اطلاعات اصلی حساب کاربری شما</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture / Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      {profileImage && <AvatarImage src={profileImage} alt="" />}
                      <AvatarFallback className="text-2xl">
                        {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onAvatarChange}
                    />
                    <div className="absolute -bottom-2 -left-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={avatarLoading}
                        onClick={() => avatarInputRef.current?.click()}
                        title="تغییر آواتار"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      {profileImage && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={avatarLoading}
                          onClick={onDeleteAvatar}
                          title="حذف آواتار"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user?.username}</h3>
                    <p className="text-gray-600">عضو از {new Date(createdAt || '').toLocaleDateString('fa-IR')}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">نام کاربری</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">نام کاربری قابل تغییر نیست</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">ایمیل</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled
                        className="pr-10"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isEmailVerified ? 'default' : 'secondary'}>
                        {isEmailVerified ? 'تایید شده' : 'تایید نشده'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">شماره تلفن</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled
                        className="pr-10"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isPhoneVerified ? 'default' : 'secondary'}>
                        {isPhoneVerified ? 'تایید شده' : 'تایید نشده'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="first_name">نام</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">نام خانوادگی</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="organization" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      سازمان / شرکت
                    </Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      disabled={!isEditing}
                      placeholder="در صورت تمایل نام سازمان یا شرکت خود را وارد کنید"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>تاریخ عضویت</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(createdAt || '').toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  {/* Resume */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      رزومه
                    </Label>
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={onResumeChange}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      {resumeFile ? (
                        <>
                          <a
                            href={resumeDownloadUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            دانلود رزومه
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resumeLoading}
                            onClick={() => resumeInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 ml-1" />
                            تغییر رزومه
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resumeLoading}
                            onClick={onDeleteResume}
                          >
                            <Trash2 className="h-4 w-4 ml-1" />
                            حذف رزومه
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={resumeLoading}
                          onClick={() => resumeInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 ml-1" />
                          آپلود رزومه (PDF یا Word)
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  امنیت حساب
                </CardTitle>
                <CardDescription>مدیریت رمز عبور و امنیت حساب</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium">رمز عبور</h4>
                        <p className="text-sm text-gray-600">آخرین تغییر: 3 ماه پیش</p>
                      </div>
                    </div>
                    <Button variant="outline">تغییر رمز عبور</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium">احراز هویت دو مرحله‌ای</h4>
                        <p className="text-sm text-gray-600">افزایش امنیت حساب</p>
                      </div>
                    </div>
                    <Button variant="outline">فعال‌سازی</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium">تایید شماره تلفن</h4>
                        <p className="text-sm text-gray-600">
                          {isPhoneVerified ? 'تایید شده' : 'تایید نشده'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">
                      {isPhoneVerified ? 'تایید شده' : 'تایید شماره'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  تنظیمات اعلان‌ها
                </CardTitle>
                <CardDescription>مدیریت نحوه دریافت اعلان‌ها</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">اعلان‌های ایمیل</h4>
                      <p className="text-sm text-gray-600">دریافت اعلان‌ها از طریق ایمیل</p>
                    </div>
                    <Button variant="outline">فعال</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">اعلان‌های پیامکی</h4>
                      <p className="text-sm text-gray-600">دریافت اعلان‌ها از طریق پیامک</p>
                    </div>
                    <Button variant="outline">غیرفعال</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">اعلان‌های مرورگر</h4>
                      <p className="text-sm text-gray-600">دریافت اعلان‌ها در مرورگر</p>
                    </div>
                    <Button variant="outline">فعال</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات عمومی</CardTitle>
                <CardDescription>تنظیمات شخصی‌سازی حساب</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">زبان</h4>
                      <p className="text-sm text-gray-600">زبان رابط کاربری</p>
                    </div>
                    <Button variant="outline">فارسی</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">منطقه زمانی</h4>
                      <p className="text-sm text-gray-600">Asia/Tehran (GMT+3:30)</p>
                    </div>
                    <Button variant="outline">تغییر</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">حذف حساب</h4>
                      <p className="text-sm text-gray-600">حذف دائمی حساب کاربری</p>
                    </div>
                    <Button variant="destructive">حذف حساب</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
