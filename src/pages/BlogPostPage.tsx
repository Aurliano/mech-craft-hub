import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Eye, Heart, User, ArrowRight, PlayCircle, Download, FileText, BookOpen } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  content_type?: string;
  category: string;
  author_name: string;
  featured_image?: string;
  source_url?: string;
  source_name?: string;
  view_count: number;
  like_count: number;
  reading_time: number;
  comments_count: number;
  published_at: string;
  meta_description?: string;
  meta_keywords?: string;
  video_url?: string;
  download_url?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}


const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    if (!slug) return;
    
    try {
      setIsLoading(true);
      // Use scientific-content public endpoint by slug to match cards
      const response = await fetch(getApiUrl(`/api/v1/scientific-content/by-slug/${slug}/`));
      if (!response.ok) throw new Error('مقاله یافت نشد');
      
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: "خطا",
        description: "مقاله یافت نشد",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [slug]);


  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const getCategoryLabel = (categoryValue: string) => {
    const categoryLabels: { [key: string]: string } = {
      'mechatronics': 'مکاترونیک',
      'mechanical': 'مهندسی مکانیک',
      'electronics': 'مهندسی الکترونیک',
      'computer': 'مهندسی کامپیوتر',
      'metaverse': 'متاورس',
      'ai': 'هوش مصنوعی',
      'simulation': 'شبیه‌سازی',
      'design': 'طراحی',
      'manufacturing': 'ساخت و تولید',
      'general': 'عمومی',
    };
    return categoryLabels[categoryValue] || categoryValue;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Navbar />
        <div className="container mx-auto px-4">
          <Card className="text-center py-12">
            <CardContent>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">مقاله یافت نشد</h1>
              <p className="text-gray-600 mb-6">مقاله مورد نظر شما وجود ندارد یا حذف شده است.</p>
              <Button asChild>
                <Link to="/blog">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  بازگشت به وبلاگ
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-600">خانه</Link>
              <ArrowRight className="h-4 w-4" />
              <Link to="/blog" className="hover:text-blue-600">وبلاگ</Link>
              <ArrowRight className="h-4 w-4" />
              <span className="text-gray-900">{post.title}</span>
            </div>
          </nav>

          {/* Article */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline">
                  {getCategoryLabel(post.category)}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 ml-1" />
                  {formatDate(post.published_at)}
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                {post.title}
              </CardTitle>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 ml-1" />
                  {post.author_name}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 ml-1" />
                    {post.reading_time} دقیقه مطالعه
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 ml-1" />
                    {post.view_count} بازدید
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 ml-1" />
                    {post.like_count} لایک
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {post.featured_image && (
                <div className="mb-6">
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>
              
              {/* Media Section - Video Player or Download Link */}
              {(post.video_url || post.download_url || post.file_url) && (
                <div className="mt-8 mb-6">
                  {post.content_type === 'video' && post.video_url ? (
                    <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <PlayCircle className="h-6 w-6 text-red-600" />
                          مشاهده ویدیو
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full rounded-lg overflow-hidden bg-black">
                          <video 
                            controls 
                            className="w-full h-auto max-h-[600px]"
                            poster={post.featured_image}
                          >
                            <source src={post.video_url} type="video/mp4" />
                            <source src={post.video_url} type="video/webm" />
                            مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                            <a href={post.video_url} className="text-blue-500 underline">
                              برای دانلود ویدیو اینجا کلیک کنید
                            </a>
                          </video>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            {post.file_name && (
                              <span className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {post.file_name}
                              </span>
                            )}
                          </p>
                          {post.file_size && (
                            <p className="text-sm text-gray-500">
                              حجم: {(post.file_size / (1024 * 1024)).toFixed(2)} مگابایت
                            </p>
                          )}
                        </div>
                        <Button 
                          asChild 
                          variant="outline" 
                          className="mt-4 w-full"
                        >
                          <a href={post.video_url} target="_blank" rel="noopener noreferrer" download>
                            <Download className="h-4 w-4 ml-2" />
                            دانلود ویدیو
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (post.download_url || post.file_url) ? (
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          {post.content_type === 'book' ? (
                            <BookOpen className="h-6 w-6 text-blue-600" />
                          ) : (
                            <Download className="h-6 w-6 text-blue-600" />
                          )}
                          {post.content_type === 'book' ? 'دانلود کتاب' : 'دانلود فایل'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-gray-700">
                            {post.content_type === 'book' 
                              ? 'می‌توانید این کتاب را دانلود کرده و مطالعه کنید.'
                              : 'می‌توانید این فایل را دانلود کنید.'}
                          </p>
                          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              {post.content_type === 'book' ? (
                                <BookOpen className="h-8 w-8 text-blue-600" />
                              ) : (
                                <FileText className="h-8 w-8 text-blue-600" />
                              )}
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {post.file_name || 'فایل ضمیمه'}
                                </p>
                                {post.file_size && (
                                  <p className="text-sm text-gray-500">
                                    حجم: {(post.file_size / (1024 * 1024)).toFixed(2)} مگابایت
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button 
                              asChild 
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <a 
                                href={post.download_url || post.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                download
                              >
                                <Download className="h-4 w-4 ml-2" />
                                دانلود
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              )}
              
              {post.source_url && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>منبع:</strong> {post.source_name || 'منبع خارجی'}
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <a href={post.source_url} target="_blank" rel="noopener noreferrer">
                      مشاهده منبع اصلی
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section - Temporarily disabled for ScientificContent */}
          {/* TODO: Implement comments system for ScientificContent */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
