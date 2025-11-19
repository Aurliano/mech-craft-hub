import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, FileText, Settings, Bell, CheckCircle, Clock, 
  Briefcase, Star, AlertCircle, Plus, Edit, Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useGetSpecialistProfile } from '@/hooks/useSpecialist';

const SpecialistDashboard = () => {
  const { user, notifications, isSpecialist } = useAuth();
  const navigate = useNavigate();
  const { data: profileData, isLoading } = useGetSpecialistProfile();
  
  const profile = profileData as { results?: Array<{
    id: string;
    is_approved: boolean;
    specialist_code?: string;
    province?: string;
    city?: string;
    education?: string;
    field_of_study?: string;
  }> } | undefined;
  
  const myProfile = profile?.results?.[0];
  const hasProfile = !!myProfile;
  const isApproved = myProfile?.is_approved || false;
  const profileLink = hasProfile ? '/specialist-profile' : '/specialist-onboarding';

  React.useEffect(() => {
    if (!isLoading && !hasProfile) {
      navigate('/specialist-onboarding', { replace: true });
    }
  }, [isLoading, hasProfile, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const recentNotifications = Array.isArray(notifications) ? notifications.slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">داشبورد نیروی متخصص</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                خوش آمدید، {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </p>
            </div>
          </div>

          {/* Profile Status Card */}
          {hasProfile ? (
            <Card className={isApproved ? "border-green-500" : "border-yellow-500"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isApproved ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Clock className="h-6 w-6 text-yellow-600" />
                    )}
                    <div>
                      <CardTitle>پروفایل کاریابی</CardTitle>
                      <CardDescription>
                        {isApproved 
                          ? 'پروفایل شما تایید شده و در شبکه همکاران نمایش داده می‌شود'
                          : 'پروفایل شما در انتظار بررسی توسط ادمین است'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={isApproved ? "default" : "secondary"}>
                    {isApproved ? 'تایید شده' : 'در انتظار تایید'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {myProfile.specialist_code && (
                    <div>
                      <p className="text-sm text-gray-600">کد اختصاصی</p>
                      <p className="text-lg font-semibold">{myProfile.specialist_code}</p>
                    </div>
                  )}
                  {myProfile.province && myProfile.city && (
                    <div>
                      <p className="text-sm text-gray-600">محل سکونت</p>
                      <p className="text-lg font-semibold">{myProfile.province}، {myProfile.city}</p>
                    </div>
                  )}
                  {myProfile.education && (
                    <div>
                      <p className="text-sm text-gray-600">تحصیلات</p>
                      <p className="text-lg font-semibold">{myProfile.education}</p>
                    </div>
                  )}
                  {myProfile.field_of_study && (
                    <div>
                      <p className="text-sm text-gray-600">رشته تحصیلی</p>
                      <p className="text-lg font-semibold">{myProfile.field_of_study}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="default">
                    <Link to={profileLink}>
                      <Edit className="h-4 w-4 ml-2" />
                      ویرایش پروفایل
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>پروفایل کاریابی ثبت نشده</CardTitle>
                    <CardDescription>
                      برای شروع، پروفایل کاریابی خود را تکمیل کنید
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="default" size="lg" className="w-full sm:w-auto">
                  <Link to="/specialist-onboarding">
                    <Plus className="h-4 w-4 ml-2" />
                    ثبت پروفایل کاریابی
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link to={profileLink}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">پروفایل کاریابی</CardTitle>
                      <CardDescription>
                        {hasProfile ? 'ویرایش پروفایل' : 'ثبت پروفایل'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to="/profile">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-green-600" />
                    <div>
                      <CardTitle className="text-lg">ویرایش حساب کاربری</CardTitle>
                      <CardDescription>تغییر اطلاعات شخصی</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to="/notifications">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Bell className="h-8 w-8 text-yellow-600" />
                    <div>
                      <CardTitle className="text-lg">اعلان‌ها</CardTitle>
                      <CardDescription>
                        {recentNotifications.length > 0 
                          ? `${recentNotifications.length} اعلان جدید`
                          : 'بدون اعلان جدید'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          </div>

          {/* Recent Notifications */}
          {recentNotifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>آخرین اعلان‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentNotifications.map((notification: { id: string; title?: string; message?: string; created_at?: string }) => (
                    <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{notification.title || 'اعلان'}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link to="/notifications">مشاهده همه اعلان‌ها</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SpecialistDashboard;

