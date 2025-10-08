import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, PlayCircle, Download, Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";

const ScientificContent = () => {
  const scientificContent = [
    {
      id: 1,
      title: "طراحی و تحلیل سیستم‌های مکاترونیک پیشرفته",
      type: "مقاله",
      author: "دکتر احمد محمدی",
      date: "1403/01/15",
      category: "مکاترونیک",
      description: "مقاله جامع در مورد طراحی و تحلیل سیستم‌های مکاترونیک پیشرفته با استفاده از نرم‌افزارهای تخصصی",
      link: "/blog/mechatronics-design-analysis",
      icon: FileText,
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "کتاب راهنمای جامع نرم‌افزارهای مهندسی",
      type: "کتاب",
      author: "مهندس علی رضایی",
      date: "1403/01/10",
      category: "مهندسی کامپیوتر",
      description: "کتاب کامل آموزش نرم‌افزارهای مهندسی شامل SolidWorks، ANSYS، MATLAB و سایر نرم‌افزارهای تخصصی",
      link: "/blog/engineering-software-guide",
      icon: BookOpen,
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "نرم‌افزار تحلیل تنش و کرنش",
      type: "نرم‌افزار کاربردی",
      author: "تیم توسعه سایدا",
      date: "1403/01/08",
      category: "مهندسی مکانیک",
      description: "نرم‌افزار تخصصی برای تحلیل تنش و کرنش در قطعات مکانیکی با رابط کاربری ساده و قدرتمند",
      link: "/blog/stress-analysis-software",
      icon: Download,
      color: "bg-purple-500"
    },
    {
      id: 4,
      title: "ویدیو آموزشی طراحی سه‌بعدی",
      type: "ویدیو",
      author: "مهندس فاطمه احمدی",
      date: "1403/01/05",
      category: "مهندسی مکانیک",
      description: "ویدیو آموزشی کامل طراحی سه‌بعدی با SolidWorks از مبتدی تا پیشرفته",
      link: "/blog/3d-design-tutorial",
      icon: PlayCircle,
      color: "bg-red-500"
    },
    {
      id: 5,
      title: "مقاله هوش مصنوعی در مهندسی",
      type: "مقاله",
      author: "دکتر مریم حسینی",
      date: "1403/01/03",
      category: "مهندسی کامپیوتر",
      description: "کاربردهای هوش مصنوعی در مهندسی و آینده این تکنولوژی در صنعت",
      link: "/blog/ai-in-engineering",
      icon: FileText,
      color: "bg-blue-500"
    },
    {
      id: 6,
      title: "کتاب الکترونیک صنعتی",
      type: "کتاب",
      author: "مهندس حسن کریمی",
      date: "1402/12/28",
      category: "مهندسی برق",
      description: "کتاب جامع الکترونیک صنعتی و کاربردهای آن در سیستم‌های کنترل",
      link: "/blog/industrial-electronics",
      icon: BookOpen,
      color: "bg-green-500"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "مقاله":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "کتاب":
        return "bg-green-100 text-green-800 border-green-200";
      case "نرم‌افزار کاربردی":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ویدیو":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "مکاترونیک":
        return "bg-orange-100 text-orange-800";
      case "مهندسی کامپیوتر":
        return "bg-blue-100 text-blue-800";
      case "مهندسی مکانیک":
        return "bg-green-100 text-green-800";
      case "مهندسی برق":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <section id="scientific-content" className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-yekan">
            تازه‌ترین مطالب علمی
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            دسترسی به جدیدترین مقالات، کتاب‌ها، نرم‌افزارها و ویدیوهای آموزشی در زمینه مهندسی
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {scientificContent.map((content) => {
            const IconComponent = content.icon;
            return (
              <Card key={content.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getTypeColor(content.type)} text-xs font-medium`}>
                      {content.type}
                    </Badge>
                    <div className={`p-2 rounded-lg ${content.color} text-white`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                    {content.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                    {content.description}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 ml-2" />
                      <span>{content.author}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 ml-2" />
                      <span>{content.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={`${getCategoryColor(content.category)} text-xs`}>
                      {content.category}
                    </Badge>
                    <Button asChild variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-white transition-colors">
                      <Link to={content.link}>
                        مطالعه بیشتر
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
            <Link to="/blog">
              مشاهده همه مطالب علمی
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ScientificContent;
