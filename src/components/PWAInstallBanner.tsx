import { useState, useEffect } from 'react';
import { X, Smartphone, Download, CheckCircle, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallBanner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    browserInfo, 
    isInstallable, 
    isInstalled, 
    installPWA, 
  } = usePWA();

  useEffect(() => {
    // نمایش floating button برای کاربرانی که نصب نکرده‌اند
    if (!isInstalled && browserInfo) {
      const bannerSeen = localStorage.getItem('saydatech-pwa-banner-seen') === 'true';
      
      // خودکار باز کردن message box بعد از 3 ثانیه (اولین بار)
      if (!bannerSeen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isInstalled, browserInfo]);

  const handleInstall = async () => {
    if (isInstallable) {
      await installPWA();
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('saydatech-pwa-banner-seen', 'true');
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  // اگر نصب شده، هیچ چیزی نمایش نده
  if (isInstalled) return null;

  // Floating button (همیشه نمایش داده می‌شود)
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-50" dir="rtl">
        <Button
          onClick={toggleWidget}
          size="lg"
          className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Download className="h-6 w-6 sm:h-7 sm:w-7" />
        </Button>
      </div>
    );
  }

  // Message Box (شبیه SupportWidget)
  const getInstallText = () => {
    if (!browserInfo) return 'نصب اپلیکیشن';
    
    if (browserInfo.isIOS && browserInfo.isSafari) {
      return 'افزودن به صفحه اصلی در Safari';
    } else if (browserInfo.isAndroid && browserInfo.isChrome) {
      return 'نصب اپلیکیشن در Chrome';
    } else if (browserInfo.isAndroid && browserInfo.isSamsungInternet) {
      return 'افزودن به صفحه اصلی';
    } else if (browserInfo.isDesktop) {
      return 'نصب اپلیکیشن در دسکتاپ';
    }
    
    return 'افزودن به صفحه اصلی';
  };

  const getInstallIcon = () => {
    if (!browserInfo) return <Smartphone className="h-5 w-5" />;
    
    if (browserInfo.isDesktop) {
      return <Download className="h-5 w-5" />;
    }
    
    return <Smartphone className="h-5 w-5" />;
  };

  return (
    <div className="fixed bottom-6 left-6 z-50" dir="rtl">
      <Card className="w-80 sm:w-96 max-h-[calc(100vh-3rem)] shadow-2xl border-0 bg-white">
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm font-semibold">نصب اپلیکیشن</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleWidget}
              className="text-white hover:bg-white/20 h-8 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex flex-col space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* AI Message */}
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg px-3 py-2 bg-gray-100 text-gray-900">
              <div className="flex items-start gap-2">
                <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-2">سلام! می‌تونید اپلیکیشن ما رو نصب کنید و از مزایای زیر بهره‌مند شوید:</p>
                  <ul className="space-y-1 text-xs list-disc list-inside mr-2">
                    <li>دسترسی سریع بدون نیاز به مرورگر</li>
                    <li>کارایی بالاتر و سرعت بیشتر</li>
                    <li>آفلاین‌مز با امکان استفاده offline</li>
                    <li>آیکون اختصاصی روی صفحه اصلی</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Box */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">پلتفرم مهندسی سایدا</p>
              <p className="text-xs">نصب سریع و دسترسی آسان</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            {isInstallable ? (
              <Button
                onClick={handleInstall}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                {getInstallIcon()}
                <span className="mr-1">{getInstallText()}</span>
              </Button>
            ) : (
              <div className="flex-1 text-center py-2 px-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">
                  از منوی مرورگر نصب کنید
                </p>
              </div>
            )}
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="px-3"
            >
              بعداً
            </Button>
          </div>

          {/* Help text for manual install */}
          {!isInstallable && (
            <p className="text-xs text-gray-500 text-center">
              {browserInfo?.isIOS ? (
                <>منوی Share → Add to Home Screen</>
              ) : browserInfo?.isAndroid ? (
                <>منوی سه نقطه → Add to Home Screen</>
              ) : (
                <>از منوی مرورگر نصب کنید</>
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallBanner;
