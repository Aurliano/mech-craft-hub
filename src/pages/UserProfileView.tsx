import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, ArrowRight, Star, FileText, Building2, Briefcase, Download, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { api, UserPublicProfile } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { dateToJalaliString } from '@/lib/dateUtils';

const UserProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .getUserPublicProfile(id)
      .then(setProfile)
      .catch((err) => {
        console.error(err);
        toast({
          title: 'خطا',
          description: 'کاربر یافت نشد',
          variant: 'destructive',
        });
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStartChat = () => {
    if (!profile) return;
    navigate(`/messages?user=${profile.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.first_name || profile.last_name
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : profile.username;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  {profile.profile_image && (
                    <AvatarImage src={profile.profile_image} alt={displayName} />
                  )}
                  <AvatarFallback className="text-2xl">
                    {(profile.first_name?.[0] || profile.username[0] || '?').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-right">
                  <CardTitle className="text-2xl">{displayName}</CardTitle>
                  <CardDescription>
                    {profile.username && profile.username.includes('*')
                      ? 'شماره همراه تأیید شده'
                      : `@${profile.username}`}
                  </CardDescription>
                  {profile.display_id && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      ID: {profile.display_id}
                    </p>
                  )}
                  {profile.role && (
                    <Badge variant="secondary" className="mt-2">
                      {profile.role.display_name}
                    </Badge>
                  )}
                  {profile.created_at && (
                    <p className="text-sm text-muted-foreground mt-2">
                      عضویت از {dateToJalaliString(profile.created_at)}
                    </p>
                  )}
                  {profile.average_rating !== null && profile.average_rating !== undefined && (
                    <div className="flex items-center gap-1 mt-2 justify-center sm:justify-start">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{profile.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleStartChat} className="flex-1">
                <MessageSquare className="w-4 h-4 ml-2" />
                شروع چت
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowRight className="w-4 h-4 ml-2" />
                بازگشت
              </Button>
            </CardContent>
          </Card>

          {/* Details Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">اطلاعات</TabsTrigger>
              <TabsTrigger value="projects">پروژه‌ها</TabsTrigger>
              <TabsTrigger value="workshops">کارگاه‌ها</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>اطلاعات عمومی</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.organization && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">سازمان</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{profile.organization}</p>
                    </div>
                  )}
                  
                  {profile.resume_url && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">رزومه</span>
                      </div>
                      <a
                        href={profile.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        دانلود رزومه
                      </a>
                    </div>
                  )}

                  {profile.specialist_profile && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">پروفایل متخصص</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">استان:</span> {profile.specialist_profile.province}
                        </p>
                        <p>
                          <span className="font-medium">شهر:</span> {profile.specialist_profile.city}
                        </p>
                        <p>
                          <span className="font-medium">تحصیلات:</span> {profile.specialist_profile.education}
                        </p>
                        {profile.specialist_profile.skills && profile.specialist_profile.skills.length > 0 && (
                          <div>
                            <span className="font-medium">مهارت‌ها:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {profile.specialist_profile.skills.map((skill: any, idx: number) => (
                                <Badge key={idx} variant="outline">
                                  {typeof skill === 'string' ? skill : skill.name || skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>پروژه‌های تکمیل شده</CardTitle>
                  <CardDescription>
                    {profile.total_completed_projects || 0} پروژه
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.total_completed_projects && profile.total_completed_projects > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      این کاربر {profile.total_completed_projects} پروژه را با موفقیت تکمیل کرده است.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      هنوز پروژه تکمیل شده‌ای وجود ندارد.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Workshops Tab */}
            <TabsContent value="workshops" className="space-y-4">
              {profile.workshops && profile.workshops.length > 0 ? (
                <div className="grid gap-4">
                  {profile.workshops.map((workshop) => (
                    <Card key={workshop.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{workshop.name}</CardTitle>
                            <CardDescription>
                              کد: {workshop.code}
                              {workshop.workshop_class && ` • کلاس: ${workshop.workshop_class}`}
                            </CardDescription>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/manufacturing?workshop=${workshop.id}`}>
                              مشاهده کارگاه
                            </Link>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">تعداد دستگاه‌ها:</span> {workshop.machines_count}
                          </p>
                          {workshop.machines && workshop.machines.length > 0 && (
                            <div>
                              <span className="text-sm font-medium">پیش‌نمایش دستگاه‌ها:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {workshop.machines.slice(0, 3).map((machine: any, idx: number) => (
                                  <Badge key={idx} variant="secondary">
                                    {typeof machine === 'string' ? machine : machine.name || `دستگاه ${idx + 1}`}
                                  </Badge>
                                ))}
                                {workshop.machines_count > 3 && (
                                  <Badge variant="outline">
                                    +{workshop.machines_count - 3} بیشتر
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    کارگاهی یافت نشد.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
