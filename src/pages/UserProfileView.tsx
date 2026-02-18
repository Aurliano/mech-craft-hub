import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { api, UserPublicProfile } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

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
        <div className="max-w-2xl mx-auto">
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
                  <CardDescription>@{profile.username}</CardDescription>
                  {profile.role && (
                    <Badge variant="secondary" className="mt-2">
                      {profile.role.display_name}
                    </Badge>
                  )}
                  {profile.created_at && (
                    <p className="text-sm text-muted-foreground mt-2">
                      عضویت از {new Date(profile.created_at).toLocaleDateString('fa-IR')}
                    </p>
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
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
