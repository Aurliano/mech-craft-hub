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
      action: "https://t.me/saydatech"
    },
    {
      icon: MessageCircle,
      title: "ایتا",
      description: "پیام‌رسان داخلی برای ارتباط مستقیم با پشتیبان",
      info: "saydatech_ir@",
      action: "https://eitaa.com/saydatech_ir"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {contactMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-card border-border cursor-pointer"
                    onClick={() => window.open(method.action, '_blank')}>
                <CardHeader className="text-center p-3 sm:p-4 lg:p-4">
                  <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:shadow-glow transition-all duration-300">
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-foreground text-right text-xs sm:text-sm lg:text-sm">{method.title}</CardTitle>
                  <CardDescription className="text-muted-foreground text-right text-xs sm:text-xs lg:text-xs leading-tight">
                    {method.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-right p-3 sm:p-4 lg:p-4 pt-0">
                  <div className="text-center">
                    <p className="font-semibold text-primary mb-2 text-xs sm:text-sm lg:text-sm truncate">{method.info}</p>
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