import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Phone, Calendar, Shield, Key, Bell, Camera, Save, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

const Profile = () => {
  const { user, isLoadingDashboard } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

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

  const handleSave = () => {
    // TODO: Implement save profile
    console.log('Save profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    });
    setIsEditing(false);
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
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 ml-2" />
                ذخیره تغییرات
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
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -left-2"
                      variant="outline"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user?.username}</h3>
                    <p className="text-gray-600">عضو از {new Date(user?.created_at || '').toLocaleDateString('fa-IR')}</p>
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
                      disabled={!isEditing}
                    />
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
                        disabled={!isEditing}
                        className="pr-10"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user?.is_email_verified ? 'default' : 'secondary'}>
                        {user?.is_email_verified ? 'تایید شده' : 'تایید نشده'}
                      </Badge>
                      {!user?.is_email_verified && (
                        <Button variant="link" size="sm" className="p-0 h-auto">
                          ارسال لینک تایید
                        </Button>
                      )}
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
                        disabled={!isEditing}
                        className="pr-10"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user?.is_phone_verified ? 'default' : 'secondary'}>
                        {user?.is_phone_verified ? 'تایید شده' : 'تایید نشده'}
                      </Badge>
                      {!user?.is_phone_verified && (
                        <Button variant="link" size="sm" className="p-0 h-auto">
                          تایید شماره
                        </Button>
                      )}
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

                  <div className="space-y-2">
                    <Label>تاریخ عضویت</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(user?.created_at || '').toLocaleDateString('fa-IR')}
                      </span>
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
                          {user?.is_phone_verified ? 'تایید شده' : 'تایید نشده'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">
                      {user?.is_phone_verified ? 'تایید شده' : 'تایید شماره'}
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
