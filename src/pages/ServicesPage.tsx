import Navbar from "@/components/Navbar";
import Services from "@/components/Services";
import Footer from "@/components/Footer";

const ServicesPage = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      <main>
        <Services />
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;