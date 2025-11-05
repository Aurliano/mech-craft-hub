import Navbar from "@/components/Navbar";
import Services from "@/components/Services";
import Footer from "@/components/Footer";

const ServicesPage = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      <main>
        <div className="bg-gradient-primary py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              خدمات ما
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              ما طیف کاملی از خدمات مهندسی را ارائه می‌دهیم تا پروژه‌های شما را از ایده تا محصول نهایی پیاده‌سازی کنیم
            </p>
          </div>
        </div>
        <Services />
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;