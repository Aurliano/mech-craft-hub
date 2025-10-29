import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ScientificContent from "@/components/ScientificContent";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      <Hero />
      <ScientificContent />
      <Portfolio />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
