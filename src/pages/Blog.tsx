import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const articles = [
  {
    title: "کاربردهای نوین مکاترونیک در رباتیک صنعتی",
    source: "IEEE Spectrum",
    link: "https://spectrum.ieee.org/robotics",
  },
  {
    title: "ترندهای شبیه‌سازی مهندسی: Digital Twin و CFD",
    source: "Siemens Blog",
    link: "https://blogs.sw.siemens.com/",
  },
  {
    title: "هوش مصنوعی در کنترل و بینایی ماشین",
    source: "Google Scholar",
    link: "https://scholar.google.com/",
  },
  {
    title: "پر جستجوترین پرسش‌ها درباره نقشه‌کشی صنعتی",
    source: "Google Trends",
    link: "https://trends.google.com/",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">وبلاگ مکاترونیک</h1>
          <p className="text-muted-foreground">منتخب ترندها و مقالات به‌روز (به همراه منبع)</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((a) => (
            <a
              key={a.title}
              href={a.link}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border p-5 hover:bg-muted/50 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{a.title}</h2>
              <p className="text-sm text-muted-foreground">منبع: {a.source}</p>
            </a>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;

