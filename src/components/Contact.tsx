import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Action, Description } from "@radix-ui/react-toast";
import { Phone, MessageCircle, MapPin, Send, InstagramIcon } from "lucide-react";
import { title } from "process";

const Contact = () => {
  const contactMethods = [
    {
      icon: Phone,
      title: "تماس تلفنی",
      description: "برای مشاوره رایگان با ما تماس بگیرید",
      info: "09917064658",
      action: "tel:+989917064658"
    },
    {
      icon: Send,
      title: "تلگرام",
      description: "ارتباط سریع و آسان از طریق کانال رسمی ما در تلگرام",
      info: "@saydatech",
      action: "https://t.me/saydatech_ir"
    },
    {
      icon: MessageCircle,
      title: "ایتا",
      description: "پیام‌رسان داخلی برای ارتباط مستقیم با پشتیبان",
      info: "saydatech_ir@",
      action: "https://eitaa.com/saydatech_ir"
    },
    {
      icon: MapPin,
      title: "آدرس",
      description: "مراجعه حضوری به دفتر مرکزی",
      info: "ایران ،اصفهان",
      action: "https://maps.google.com"
    },
    {
      icon: InstagramIcon,
      title: "صفحه اینستاگرام",
      description: "صفحه رسمی ما در اینستاگرام را دنبال کنید",
      info: "saydatech",
      action: "https://www.instagram.com/saydatech/"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            تماس با ما
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            برای مشاوره، سفارش پروژه یا هرگونه سوال از طریق راه‌های زیر با ما در ارتباط باشید
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {contactMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-card border-border cursor-pointer"
                    onClick={() => window.open(method.action, '_blank')}>
                <CardHeader className="text-center p-4 sm:p-6">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:shadow-glow transition-all duration-300">
                    <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-foreground text-right text-sm sm:text-base">{method.title}</CardTitle>
                  <CardDescription className="text-muted-foreground text-right text-xs sm:text-sm">
                    {method.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-right p-4 sm:p-6 pt-0">
                  <div className="text-center">
                    <p className="font-semibold text-primary mb-2 text-sm sm:text-base">{method.info}</p>
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