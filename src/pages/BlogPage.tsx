import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Eye, Heart, Search, User, BookOpen, FileText, PlayCircle, Download, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '@/lib/api';
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
  featured_image?: string;
  source_name?: string;
  view_count: number;
  like_count: number;
  reading_time: number;
  download_url?: string;
  video_url?: string;
  file_size?: number;
  duration?: number;
  published_at: string;
}

interface ContentCategory {
  value: string;
  label: string;
  count: number;
}

const BlogPage: React.FC = () => {
  const [content, setContent] = useState<ScientificContent[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const contentTypes = [
    { value: 'all', label: 'همه انواع', icon: Filter },
    { value: 'article', label: 'مقاله', icon: FileText },
    { value: 'book', label: 'کتاب', icon: BookOpen },
    { value: 'software', label: 'نرم‌افزار کاربردی', icon: Download },
    { value: 'video', label: 'ویدیو', icon: PlayCircle },
  ];

  const fetchCategories = async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/scientific-content/categories/'));
      if (!response.ok) throw new Error('خطا در دریافت دسته‌بندی‌ها');
      const data = await response.json();
      let cats = data.categories;
      if (!cats && Array.isArray(data)) cats = data;
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // prevent future errors
    }
  };

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedType && selectedType !== 'all' && { content_type: selectedType }),
      });

      const response = await fetch(getApiUrl(`/api/v1/scientific-content/?${params}`));
      if (!response.ok) throw new Error('خطا در دریافت مطالب علمی');
      const data = await response.json();
      let results = data.results || data;
      if (!Array.isArray(results) && typeof results === 'object' && results !== null && Object.values(results).find(Array.isArray)) {
        results = Object.values(results).find(Array.isArray) || [];
      }
      setContent(Array.isArray(results) ? results : []);
      setTotalPages(data.num_pages || 1);
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [currentPage, searchTerm, selectedCategory, selectedType]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} مگابایت`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-yekan">
            مقالات و منابع علمی
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            دسترسی به جدیدترین مقالات، کتاب‌ها، نرم‌افزارها و ویدیوهای آموزشی در زمینه مهندسی
          </p>
        </div>

        {/* Introduction Section */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200">
          <CardContent className="p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                📚 مرکز منابع علمی و آموزشی پلتفرم سایدا
              </h2>
              
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4 mb-6">
                <p className="text-justify leading-relaxed">
                  به <strong>صفحه مقالات و منابع علمی</strong> پلتفرم مهندسی سایدا خوش آمدید! این بخش یک کتابخانه جامع و تخصصی از محتوای علمی و آموزشی در حوزه‌های مختلف مهندسی است که برای <strong>کاربران</strong>، <strong>کارفرمایان</strong>، <strong>دانشجویان</strong> و <strong>متخصصان</strong> طراحی شده است.
                </p>

                <div className="bg-white rounded-lg p-6 border border-blue-100 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    قابلیت‌های اصلی این صفحه:
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">مقالات تخصصی</h4>
                        <p className="text-sm text-gray-600">
                          دسترسی به مقالات علمی و تخصصی در زمینه‌های مکاترونیک، مکانیک، الکترونیک، کامپیوتر و سایر رشته‌های مهندسی
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <BookOpen className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">کتاب‌های الکترونیکی</h4>
                        <p className="text-sm text-gray-600">
                          دانلود کتاب‌های تخصصی و مراجع علمی در قالب PDF و سایر فرمت‌های رایج
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <Download className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">نرم‌افزارهای کاربردی</h4>
                        <p className="text-sm text-gray-600">
                          دسترسی به نرم‌افزارها و ابزارهای کاربردی مهندسی با امکان دانلود مستقیم
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <PlayCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">ویدیوهای آموزشی</h4>
                        <p className="text-sm text-gray-600">
                          تماشای آنلاین ویدیوهای آموزشی و تخصصی با کیفیت بالا و امکان دانلود
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-indigo-100 shadow-sm mt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Search className="h-5 w-5 text-indigo-600" />
                    امکانات جستجو و فیلتر:
                  </h3>
                  
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold mt-1">•</span>
                      <span><strong>جستجوی پیشرفته:</strong> جستجو در عنوان، محتوا و خلاصه مقالات</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold mt-1">•</span>
                      <span><strong>فیلتر بر اساس نوع:</strong> فیلتر محتوا بر اساس مقاله، کتاب، نرم‌افزار یا ویدیو</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold mt-1">•</span>
                      <span><strong>دسته‌بندی تخصصی:</strong> دسترسی به محتوا بر اساس رشته‌های مهندسی مختلف</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold mt-1">•</span>
                      <span><strong>صفحه‌بندی هوشمند:</strong> نمایش محتوا به صورت صفحه‌بندی شده برای دسترسی آسان‌تر</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white mt-6">
                  <h3 className="text-xl font-semibold mb-3">💼 برای کارفرمایان:</h3>
                  <p className="text-blue-50 leading-relaxed">
                    این صفحه به شما کمک می‌کند تا با آخرین تحولات و پیشرفت‌های علمی در حوزه مهندسی آشنا شوید، 
                    منابع معتبر برای پروژه‌های خود پیدا کنید و از محتوای آموزشی برای ارتقای سطح تیم خود استفاده نمایید. 
                    همچنین می‌توانید محتوای تخصصی مورد نیاز پروژه‌های خود را در این بخش به اشتراک بگذارید.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white mt-4">
                  <h3 className="text-xl font-semibold mb-3">👥 برای کاربران و دانشجویان:</h3>
                  <p className="text-green-50 leading-relaxed">
                    این صفحه یک منبع غنی از اطلاعات علمی و آموزشی است که می‌تواند در یادگیری، تحقیق و انجام پروژه‌های 
                    دانشگاهی و شخصی به شما کمک کند. از مقالات تخصصی تا ویدیوهای آموزشی و کتاب‌های مرجع، همه در یک مکان 
                    در دسترس شماست. همچنین می‌توانید محتوای مفید را دانلود کرده و به صورت آفلاین مطالعه کنید.
                  </p>
                </div>

                <div className="text-center mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    💡 <strong>نکته:</strong> برای دسترسی به محتوای کامل هر مطلب، روی دکمه "مطالعه بیشتر" کلیک کنید. 
                    ویدیوها به صورت آنلاین قابل پخش هستند و فایل‌ها و کتاب‌ها را می‌توانید مستقیماً دانلود کنید.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories and Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">جستجو</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="جستجو در مطالب..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">نوع محتوا</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contentTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleTypeChange(type.value)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-right transition-colors ${
                        selectedType === type.value
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">دسته‌بندی‌ها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-right p-2 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="text-sm">همه دسته‌بندی‌ها</span>
                </button>
                {Array.isArray(categories) && categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategoryChange(category.value)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-right transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="text-sm">{category.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {Array.isArray(content) && content.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {content.map((item) => {
                  const TypeIcon = getTypeIcon(item.content_type);
                  return (
                    <Card key={item.id} className="hover:shadow-lg transition-all duration-300 group">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${getTypeColor(item.content_type)} text-xs font-medium`}>
                            <TypeIcon className="h-3 w-3 ml-1" />
                            {item.content_type_display}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 ml-1" />
                            {formatDate(item.published_at)}
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          <Link to={`/blog/${item.slug}`}>
                            {item.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {item.excerpt}
                        </p>
                        
                        {item.featured_image && (
                          <div className="mb-4">
                            <img 
                              src={item.featured_image} 
                              alt={item.title}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center">
                              <User className="h-3 w-3 ml-1" />
                              {item.author_name}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 ml-1" />
                              {item.reading_time} دقیقه
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center">
                                <Eye className="h-3 w-3 ml-1" />
                                {item.view_count}
                              </div>
                              <div className="flex items-center">
                                <Heart className="h-3 w-3 ml-1" />
                                {item.like_count}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {item.category_display}
                            </Badge>
                          </div>
                        </div>

                        {/* Additional info based on content type */}
                        <div className="space-y-2 mb-4">
                          {item.content_type === 'software' && item.file_size && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Download className="h-3 w-3 ml-1" />
                              حجم: {formatFileSize(item.file_size)}
                            </div>
                          )}
                          
                          {item.content_type === 'video' && item.duration && (
                            <div className="flex items-center text-xs text-gray-500">
                              <PlayCircle className="h-3 w-3 ml-1" />
                              مدت: {formatDuration(item.duration)}
                            </div>
                          )}
                          
                          {item.source_name && (
                            <div className="text-xs text-gray-500">
                              منبع: {item.source_name}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button asChild size="sm" className="flex-1">
                            <Link to={`/blog/${item.slug}`}>
                              مطالعه بیشتر
                            </Link>
                          </Button>
                          
                          {item.download_url && (
                            <Button asChild variant="outline" size="sm">
                              <a href={item.download_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          
                          {item.video_url && (
                            <Button asChild variant="outline" size="sm">
                              <a href={item.video_url} target="_blank" rel="noopener noreferrer">
                                <PlayCircle className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-gray-500 text-lg">مطلبی یافت نشد</p>
                  <p className="text-gray-400 text-sm mt-2">
                    لطفاً کلمات کلیدی، دسته‌بندی یا نوع محتوای دیگری را امتحان کنید
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 overflow-x-auto">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                >
                  قبلی
                </Button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      onClick={() => setCurrentPage(i + 1)}
                      size="sm"
                      className="w-10 h-10"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  size="sm"
                >
                  بعدی
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;