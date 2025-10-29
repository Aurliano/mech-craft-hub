import { useState, useEffect } from 'react';
import { X, Smartphone, Download, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const { 
    browserInfo, 
    isInstallable, 
    isInstalled, 
    installPWA, 
  } = usePWA();

  useEffect(() => {
    // نمایش banner برای کاربرانی که نصب نکرده‌اند
    if (!isInstalled && browserInfo) {
      // بررسی اینکه banner قبلاً دیده شده یا نه
      const bannerSeen = localStorage.getItem('saydatech-pwa-banner-seen') === 'true';
      
      // نمایش banner بعد از 2 ثانیه
      if (!bannerSeen) {
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isInstalled, browserInfo]);

  const handleInstall = async () => {
    if (isInstallable) {
      await installPWA();
    }
    handleDismiss();
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('saydatech-pwa-banner-seen', 'true');
  };

  if (!showBanner || isInstalled) return null;

  // تشخیص مرورگر برای نمایش متن مناسب
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
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-3 left-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"
            aria-label="بستن"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-3 pr-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg">پلتفرم مهندسی سایدا</h4>
              <p className="text-blue-100 text-xs">نصب سریع و دسترسی آسان</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">مزایای نصب اپلیکیشن:</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>دسترسی سریع بدون نیاز به مرورگر</li>
                <li>کارایی بالاتر و سرعت بیشتر</li>
                <li>آفلاین‌مز با امکان استفاده offline</li>
                <li>آیکون اختصاصی روی صفحه اصلی</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isInstallable ? (
              <Button
                onClick={handleInstall}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {getInstallIcon()}
                {getInstallText()}
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
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;

