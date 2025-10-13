import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, BookOpen, Download, PlayCircle, Trash2, Eye, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ScientificContentItem {
  id: number;
  title: string;
  content_type: string;
  category: string;
  excerpt: string;
  content: string;
  author_name: string;
  published_at: string;
  view_count: number;
  download_count: number;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  status: string;
}

interface Category {
  value: string;
  label: string;
}

const FileManager = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<ScientificContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Upload form state
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'article',
    category: 'mechatronics',
    excerpt: '',
    content: '',
    file: null as File | null,
    meta_description: '',
    meta_keywords: '',
    source_url: '',
    source_name: ''
  });

  useEffect(() => {
    fetchContent();
    fetchCategories();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/v1/scientific-content/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setContent(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('خطا در بارگذاری محتوا');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/scientific-content/categories/');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('لطفاً فایل را انتخاب کنید');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('content_type', formData.content_type);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('excerpt', formData.excerpt);
      uploadFormData.append('content', formData.content);
      uploadFormData.append('meta_description', formData.meta_description);
      uploadFormData.append('meta_keywords', formData.meta_keywords);
      uploadFormData.append('source_url', formData.source_url);
      uploadFormData.append('source_name', formData.source_name);

      const response = await fetch('/api/v1/files/upload/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: uploadFormData
      });

      if (response.ok) {
        toast.success('فایل با موفقیت آپلود شد');
        setFormData({
          title: '',
          content_type: 'article',
          category: 'mechatronics',
          excerpt: '',
          content: '',
          file: null,
          meta_description: '',
          meta_keywords: '',
          source_url: '',
          source_name: ''
        });
        setShowUploadForm(false);
        fetchContent();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'خطا در آپلود فایل');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('خطا در آپلود فایل');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این فایل را حذف کنید؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/files/${id}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        toast.success('فایل با موفقیت حذف شد');
        fetchContent();
      } else {
        toast.error('خطا در حذف فایل');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('خطا در حذف فایل');
    }
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'article':
        return FileText;
      case 'book':
        return BookOpen;
      case 'software':
        return Download;
      case 'video':
        return PlayCircle;
      default:
        return FileText;
    }
  };

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'article':
        return 'مقاله';
      case 'book':
        return 'کتاب';
      case 'software':
        return 'نرم‌افزار کاربردی';
      case 'video':
        return 'ویدیو';
      default:
        return contentType;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Access control: support both string role and object role with name
  const isAdmin = !!user && (((user as unknown as Record<string, unknown>)?.role === 'admin') || ((user as unknown as { role?: { name?: string } }).role?.name === 'admin'));

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">دسترسی محدود</h2>
              <p className="text-muted-foreground">
                فقط مدیران می‌توانند به این صفحه دسترسی داشته باشند
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">مدیریت فایل‌های علمی</h1>
            <p className="text-muted-foreground">
              آپلود و مدیریت مقالات، کتاب‌ها و منابع علمی
            </p>
          </div>
          <Button onClick={() => setShowUploadForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            آپلود فایل جدید
          </Button>
        </div>

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>آپلود فایل جدید</CardTitle>
                <CardDescription>
                  اطلاعات فایل و محتوای علمی را وارد کنید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">عنوان *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="content_type">نوع محتوا *</Label>
                      <Select
                        value={formData.content_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, content_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="article">مقاله</SelectItem>
                          <SelectItem value="book">کتاب</SelectItem>
                          <SelectItem value="software">نرم‌افزار کاربردی</SelectItem>
                          <SelectItem value="video">ویدیو</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">دسته‌بندی *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">خلاصه *</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">محتوای کامل</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="file">فایل *</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.mp4,.avi,.mov,.zip,.rar"
                      onChange={handleFileChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="source_url">لینک منبع</Label>
                      <Input
                        id="source_url"
                        value={formData.source_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="source_name">نام منبع</Label>
                      <Input
                        id="source_name"
                        value={formData.source_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, source_name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="meta_description">توضیحات SEO</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_keywords">کلمات کلیدی</Label>
                    <Input
                      id="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                      placeholder="کلمات کلیدی را با کاما جدا کنید"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUploadForm(false)}
                    >
                      انصراف
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? 'در حال آپلود...' : 'آپلود فایل'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="mr-3 text-muted-foreground">در حال بارگذاری...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => {
              const Icon = getContentIcon(item.content_type);
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <Badge variant="secondary">
                          {getContentTypeLabel(item.content_type)}
                        </Badge>
                      </div>
                      <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                        {item.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3 mb-4">
                      {item.excerpt}
                    </CardDescription>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium">نویسنده:</span>
                        <span className="mr-2">{item.author_name}</span>
                      </div>
                      {item.file_name && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="font-medium">فایل:</span>
                          <span className="mr-2">{item.file_name}</span>
                          {item.file_size && (
                            <span className="mr-2">({formatFileSize(item.file_size)})</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium">بازدید:</span>
                        <span className="mr-2">{item.view_count}</span>
                        <span className="font-medium">دانلود:</span>
                        <span className="mr-2">{item.download_count}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {item.file_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {content.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">هنوز فایلی آپلود نشده</h3>
            <p className="text-muted-foreground mb-6">
              اولین فایل علمی خود را آپلود کنید
            </p>
            <Button onClick={() => setShowUploadForm(true)}>
              <Plus className="h-4 w-4 ml-2" />
              آپلود فایل جدید
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;