import { useState, useEffect } from 'react';
import { X, Smartphone, Download, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallGuide = () => {
  const [showGuide, setShowGuide] = useState(false);
  const { 
    browserInfo, 
    isInstallable, 
    isInstalled, 
    installPWA, 
    canShowInstallPrompt, 
    markGuideAsSeen 
  } = usePWA();

  useEffect(() => {
    // اگر قبلاً نصب شده، راهنما نمایش نده
    if (isInstalled) {
      return;
    }

    // بررسی اینکه آیا می‌توان راهنما را نمایش داد
    if (canShowInstallPrompt()) {
      // برای iOS Safari، راهنما را بعد از چند ثانیه نمایش بده
      if (browserInfo?.isIOS && browserInfo?.isSafari) {
        setTimeout(() => setShowGuide(true), 3000);
      } else {
        // برای سایر مرورگرها، راهنما را بعد از 2 ثانیه نمایش بده
        setTimeout(() => setShowGuide(true), 2000);
      }
    }
  }, [isInstalled, canShowInstallPrompt, browserInfo]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      console.log('PWA installed successfully');
    }
    setShowGuide(false);
    markGuideAsSeen();
  };

  const handleDismiss = () => {
    setShowGuide(false);
    markGuideAsSeen();
  };

  const getInstallInstructions = () => {
    if (!browserInfo) return null;

    if (browserInfo.isIOS && browserInfo.isSafari) {
      return {
        title: "افزودن به صفحه اصلی در iOS",
        subtitle: "برای دسترسی سریع‌تر به پلتفرم مهندسی سایدا",
        steps: [
          {
            icon: "📱",
            text: "روی دکمه Share (مربع با فلش) در پایین صفحه ضربه بزنید"
          },
          {
            icon: "➕",
            text: "گزینه 'Add to Home Screen' را انتخاب کنید"
          },
          {
            icon: "✅",
            text: "روی 'Add' ضربه بزنید"
          }
        ],
        note: "پس از نصب، آیکون پلتفرم مهندسی سایدا روی صفحه اصلی شما ظاهر خواهد شد"
      };
    } else if (browserInfo.isAndroid && browserInfo.isChrome) {
      return {
        title: "افزودن به صفحه اصلی در Android",
        subtitle: "برای دسترسی سریع‌تر به پلتفرم مهندسی سایدا",
        steps: [
          {
            icon: "⋮",
            text: "روی منوی سه نقطه در بالا سمت راست ضربه بزنید"
          },
          {
            icon: "📱",
            text: "گزینه 'Add to Home Screen' را انتخاب کنید"
          },
          {
            icon: "✅",
            text: "روی 'Add' ضربه بزنید"
          }
        ],
        note: "پس از نصب، آیکون پلتفرم مهندسی سایدا روی صفحه اصلی شما ظاهر خواهد شد"
      };
    } else if (browserInfo.isFirefox) {
      return {
        title: "افزودن به صفحه اصلی در Firefox",
        subtitle: "برای دسترسی سریع‌تر به پلتفرم مهندسی سایدا",
        steps: [
          {
            icon: "☰",
            text: "روی منوی سه خط در بالا سمت راست ضربه بزنید"
          },
          {
            icon: "📱",
            text: "گزینه 'Install' را انتخاب کنید"
          },
          {
            icon: "✅",
            text: "روی 'Add' ضربه بزنید"
          }
        ],
        note: "پس از نصب، آیکون پلتفرم مهندسی سایدا روی صفحه اصلی شما ظاهر خواهد شد"
      };
    } else if (browserInfo.isDesktop) {
      return {
        title: "نصب اپلیکیشن دسکتاپ",
        subtitle: "برای دسترسی سریع‌تر به پلتفرم مهندسی سایدا",
        steps: [
          {
            icon: "🔧",
            text: "روی آیکون نصب در نوار آدرس کلیک کنید"
          },
          {
            icon: "📱",
            text: "گزینه 'Install' را انتخاب کنید"
          },
          {
            icon: "✅",
            text: "روی 'Install' کلیک کنید"
          }
        ],
        note: "پس از نصب، اپلیکیشن پلتفرم مهندسی سایدا در منوی شروع شما ظاهر خواهد شد"
      };
    }
    
    return {
      title: "افزودن به صفحه اصلی",
      subtitle: "برای دسترسی سریع‌تر به پلتفرم مهندسی سایدا",
      steps: [
        {
          icon: "🔧",
          text: "منوی مرورگر را باز کنید"
        },
        {
          icon: "📱",
          text: "گزینه 'Add to Home Screen' یا 'Install' را پیدا کنید"
        },
        {
          icon: "✅",
          text: "روی آن کلیک کنید"
        }
      ],
      note: "پس از نصب، آیکون پلتفرم مهندسی سایدا روی صفحه اصلی شما ظاهر خواهد شد"
    };
  };

  if (!showGuide || isInstalled) return null;

  const instructions = getInstallInstructions();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Smartphone className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {instructions?.title}
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {instructions?.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            {instructions?.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 text-lg rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 text-sm leading-relaxed">{step.text}</p>
                </div>
                {index < instructions.steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mt-2" />
                )}
              </div>
            ))}
          </div>

          {/* Note */}
          {instructions?.note && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-800 text-sm leading-relaxed">
                  {instructions.note}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {isInstallable && (
              <Button
                onClick={handleInstall}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                افزودن به صفحه اصلی
              </Button>
            )}
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              بعداً
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallGuide;
