import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Eye, Heart, User, ArrowRight, Send } from 'lucide-react';
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
}

interface BlogComment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });

  const fetchPost = async () => {
    if (!slug) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl(`/api/v1/blog/posts/${slug}/`));
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
  };

  const fetchComments = async () => {
    if (!slug) return;
    
    try {
      const response = await fetch(getApiUrl(`/api/v1/blog/posts/${slug}/comments/`));
      if (!response.ok) throw new Error('خطا در دریافت نظرات');
      
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    try {
      setIsSubmittingComment(true);
      const response = await fetch(getApiUrl(`/api/v1/blog/posts/${slug}/comments/create/`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentForm)
      });

      if (!response.ok) throw new Error('خطا در ارسال نظر');
      
      const data = await response.json();
      toast({
        title: "موفق",
        description: data.message,
      });
      
      setCommentForm({ author_name: '', author_email: '', content: '' });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "خطا",
        description: "خطا در ارسال نظر",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [slug]);

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

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">نظرات ({comments.length})</CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="نام شما"
                    value={commentForm.author_name}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, author_name: e.target.value }))}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="ایمیل شما"
                    value={commentForm.author_email}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, author_email: e.target.value }))}
                    required
                  />
                </div>
                
                <Textarea
                  placeholder="نظر خود را بنویسید..."
                  value={commentForm.content}
                  onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  required
                  className="mb-4"
                />
                
                <Button type="submit" disabled={isSubmittingComment}>
                  {isSubmittingComment ? (
                    <>
                      <Send className="h-4 w-4 ml-2 animate-spin" />
                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 ml-2" />
                      ارسال نظر
                    </>
                  )}
                </Button>
              </form>

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{comment.author_name}</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    هنوز نظری برای این مقاله ثبت نشده است. اولین نفر باشید که نظر می‌دهد!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
