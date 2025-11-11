import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ScientificContent from "@/components/ScientificContent";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowLeft } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      <Hero />
      <ScientificContent />
      
      {/* Specialist Hiring Preview Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">شبکه همکاران متخصص</h2>
            <p className="text-gray-600 mb-6">
              به شبکه گسترده نیروهای متخصص ما متصل شوید و بهترین استعدادها را برای پروژه‌های خود پیدا کنید
            </p>
          </div>
          
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">نیروهای متخصص آماده همکاری</CardTitle>
              </div>
              <CardDescription className="text-center">
                در زمینه‌های مهندسی مکانیک، کامپیوتر، الکترونیک و متاورس
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>بررسی و تایید هویت متخصصان</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>دسترسی به رزومه و مهارت‌ها</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>جستجو بر اساس تخصص و موقعیت</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>ارتباط مستقیم با متخصصان</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/specialist-hiring">
                    مشاهده نیروهای متخصص
                    <ArrowLeft className="h-4 w-4 mr-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link to="/specialist-register">
                    ثبت نام به عنوان متخصص
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
