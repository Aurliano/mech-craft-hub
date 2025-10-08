import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, BookOpen, Download, Trash2, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ScientificContent {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_type: string;
  content_type_display: string;
  category: string;
  category_display: string;
  author_name: string;
  file_name: string;
  file_type: string;
  file_size: number;
  download_count: number;
  is_public: boolean;
  status: string;
  created_at: string;
}

const FileManager = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<ScientificContent[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    content_type: 'book',
    category: 'general',
    status: 'published',
    is_public: true
  });

  const contentTypes = [
    { value: 'article', label: 'مقاله', icon: FileText },
    { value: 'book', label: 'کتاب', icon: BookOpen },
    { value: 'software', label: 'نرم‌افزار کاربردی', icon: Download },
    { value: 'video', label: 'ویدیو', icon: Download }
  ];

  const categories = [
    { value: 'mechatronics', label: 'مکاترونیک' },
    { value: 'mechanical', label: 'مهندسی مکانیک' },
    { value: 'electronics', label: 'مهندسی الکترونیک' },
    { value: 'computer', label: 'مهندسی کامپیوتر' },
    { value: 'metaverse', label: 'متاورس' },
    { value: 'ai', label: 'هوش مصنوعی' },
    { value: 'simulation', label: 'شبیه‌سازی' },
    { value: 'design', label: 'طراحی' },
    { value: 'manufacturing', label: 'ساخت و تولید' },
    { value: 'general', label: 'عمومی' }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // بررسی نوع فایل
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'video/mp4',
      'video/avi',
      'video/mov',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('نوع فایل مجاز نیست');
      return;
    }

    // بررسی حجم فایل (100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('حجم فایل بیش از حد مجاز است (حداکثر 100MB)');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('title', formData.title || file.name);
    formDataToSend.append('slug', formData.slug || file.name.toLowerCase().replace(/\s+/g, '-'));
    formDataToSend.append('excerpt', formData.excerpt);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('content_type', formData.content_type);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('status', formData.status);
    formDataToSend.append('is_public', formData.is_public.toString());

    try {
      const response = await fetch(getApiUrl('/api/v1/files/upload/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedFiles(prev => [result.content, ...prev]);
        setUploadProgress(100);
        
        // Reset form
        setFormData({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          content_type: 'book',
          category: 'general',
          status: 'published',
          is_public: true
        });
        
        alert('فایل با موفقیت آپلود شد');
      } else {
        const error = await response.json();
        alert(`خطا در آپلود: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('خطا در آپلود فایل');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (contentId: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/files/${contentId}/download/`));
      if (response.ok) {
        const result = await response.json();
        window.open(result.download_url, '_blank');
      } else {
        alert('خطا در دانلود فایل');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('خطا در دانلود فایل');
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این فایل را حذف کنید؟')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/v1/files/${contentId}/delete/`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        setUploadedFiles(prev => prev.filter(file => file.id !== contentId));
        alert('فایل با موفقیت حذف شد');
      } else {
        alert('خطا در حذف فایل');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('خطا در حذف فایل');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    const typeObj = contentTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : FileText;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'book':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'software':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'video':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">مدیریت فایل‌های علمی</h1>
            <p className="text-gray-600">آپلود و مدیریت کتاب‌ها، مقالات و منابع علمی</p>
          </div>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                آپلود فایل جدید
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Input */}
              <div>
                <Label htmlFor="file">انتخاب فایل</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  انواع فایل مجاز: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, MP4, AVI, MOV, ZIP, RAR, 7Z
                  <br />
                  حداکثر حجم: 100MB
                </p>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                  <p className="text-sm text-gray-600">در حال آپلود...</p>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">عنوان</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="عنوان محتوا"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">آدرس URL</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="آدرس-url"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">خلاصه</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="خلاصه کوتاه از محتوا"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">محتوای کامل</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="توضیحات کامل محتوا"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="content_type">نوع محتوا</Label>
                  <Select value={formData.content_type} onValueChange={(value) => setFormData({...formData, content_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">دسته‌بندی</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
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
                  <Label htmlFor="status">وضعیت</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">منتشر شده</SelectItem>
                      <SelectItem value="draft">پیش‌نویس</SelectItem>
                      <SelectItem value="archived">آرشیو شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          <Card>
            <CardHeader>
              <CardTitle>فایل‌های آپلود شده</CardTitle>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length > 0 ? (
                <div className="space-y-4">
                  {uploadedFiles.map((file) => {
                    const TypeIcon = getTypeIcon(file.content_type);
                    return (
                      <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <TypeIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{file.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Badge className={`${getTypeColor(file.content_type)} text-xs`}>
                                {file.content_type_display}
                              </Badge>
                              <span>{formatFileSize(file.file_size)}</span>
                              <span>{file.download_count} دانلود</span>
                              {file.is_public ? (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  <CheckCircle className="h-3 w-3 ml-1" />
                                  عمومی
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-600 border-orange-200">
                                  <AlertCircle className="h-3 w-3 ml-1" />
                                  خصوصی
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(file.id)}
                          >
                            <Eye className="h-4 w-4 ml-2" />
                            مشاهده
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(file.id)}
                          >
                            <Download className="h-4 w-4 ml-2" />
                            دانلود
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>هنوز فایلی آپلود نکرده‌اید</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FileManager;
