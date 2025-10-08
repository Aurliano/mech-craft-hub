import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, PlayCircle, Download, Calendar, User, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface ScientificContentItem {
  id: number;
  title: string;
  content_type: string;
  category: string;
  excerpt: string;
  author_name: string;
  published_at: string;
  view_count: number;
  download_count: number;
  file_url?: string;
}

const ScientificContent = () => {
  const [content, setContent] = useState<ScientificContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScientificContent();
  }, []);

  const fetchScientificContent = async () => {
    try {
      const response = await fetch('/api/v1/scientific-content/?limit=4');
      if (response.ok) {
        const data = await response.json();
        setContent(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching scientific content:', error);
    } finally {
      setLoading(false);
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

  const getContentColor = (contentType: string) => {
    switch (contentType) {
      case 'article':
        return 'bg-blue-500';
      case 'book':
        return 'bg-green-500';
      case 'software':
        return 'bg-purple-500';
      case 'video':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted" id="scientific-content" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">تازه‌ترین مطالب علمی</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            جدیدترین مقالات، کتاب‌ها، نرم‌افزارهای کاربردی و ویدیوهای آموزشی در حوزه‌های مهندسی
          </p>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="mr-3 text-muted-foreground">در حال بارگذاری...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted" id="scientific-content" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">تازه‌ترین مطالب علمی</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          جدیدترین مقالات، کتاب‌ها، نرم‌افزارهای کاربردی و ویدیوهای آموزشی در حوزه‌های مهندسی
        </p>
        
        {content.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">هنوز محتوایی اضافه نشده</h3>
            <p className="text-muted-foreground mb-6">
              به زودی مقالات، کتاب‌ها و منابع علمی جدید اضافه خواهد شد
            </p>
            <Button asChild variant="outline">
              <Link to="/blog">مشاهده همه مطالب علمی</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {content.map((item) => {
                const Icon = getContentIcon(item.content_type);
                const colorClass = getContentColor(item.content_type);
                
                return (
                  <Card key={item.id} className="flex flex-col items-center text-center p-6 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-4">
                      <div className={`mx-auto w-12 h-12 ${colorClass} rounded-full flex items-center justify-center mb-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold line-clamp-2">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <Badge variant="secondary" className="mb-2">
                        {getContentTypeLabel(item.content_type)}
                      </Badge>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-3">{item.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <User className="h-3 w-3 ml-1" />
                          <span>{item.author_name}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 ml-1" />
                          <span>{new Date(item.published_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                      </div>
                    </CardContent>
                    <Button asChild variant="outline" className="mt-4 w-full">
                      <Link to={`/blog/${item.id}`}>مشاهده</Link>
                    </Button>
                  </Card>
                );
              })}
            </div>
            <Button asChild className="text-lg px-8 py-3">
              <Link to="/blog">مشاهده همه مطالب علمی</Link>
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default ScientificContent;