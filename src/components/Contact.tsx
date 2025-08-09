import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MessageCircle, MapPin, Send } from "lucide-react";

const Contact = () => {
  const contactMethods = [
    {
      icon: Phone,
      title: "تماس تلفنی",
      description: "برای مشاوره رایگان با ما تماس بگیرید",
      info: "021-12345678",
      action: "tel:+982112345678"
    },
    {
      icon: Send,
      title: "تلگرام",
      description: "ارتباط سریع و آسان از طریق تلگرام",
      info: "@pedram_industrial",
      action: "https://t.me/pedram_industrial"
    },
    {
      icon: MessageCircle,
      title: "ایتا",
      description: "پیام‌رسان داخلی برای ارتباط مستقیم",
      info: "@pedram_eitaa",
      action: "https://eitaa.com/pedram_eitaa"
    },
    {
      icon: MapPin,
      title: "آدرس",
      description: "مراجعه حضوری به دفتر مرکزی",
      info: "تهران، خیابان انقلاب، پلاک 123",
      action: "https://maps.google.com"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            تماس با ما
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            برای مشاوره، سفارش پروژه یا هرگونه سوال از طریق راه‌های زیر با ما در ارتباط باشید
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-card border-border cursor-pointer"
                    onClick={() => window.open(method.action, '_blank')}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-foreground text-right">{method.title}</CardTitle>
                  <CardDescription className="text-muted-foreground text-right">
                    {method.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-right">
                  <div className="text-center">
                    <p className="font-semibold text-primary mb-2">{method.info}</p>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Contact;