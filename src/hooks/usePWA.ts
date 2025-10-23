import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  browserInfo: {
    isIOS: boolean;
    isAndroid: boolean;
    isChrome: boolean;
    isSafari: boolean;
    isFirefox: boolean;
    isEdge: boolean;
    isDesktop: boolean;
  } | null;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    deferredPrompt: null,
    browserInfo: null
  });

  useEffect(() => {
    // تشخیص مرورگر و سیستم عامل
    const userAgent = navigator.userAgent;
    const browserInfo = {
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      isChrome: /Chrome/.test(userAgent) && !/Edge/.test(userAgent),
      isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
      isFirefox: /Firefox/.test(userAgent),
      isEdge: /Edge/.test(userAgent),
      isDesktop: !(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent))
    };

    // بررسی حالت standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // بررسی اینکه آیا PWA نصب شده یا نه
    const isInstalled = localStorage.getItem('saydatech-pwa-installed') === 'true' || isStandalone;

    setPwaState(prev => ({
      ...prev,
      browserInfo,
      isStandalone,
      isInstalled
    }));

    // گوش دادن به رویداد beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        deferredPrompt: e as BeforeInstallPromptEvent
      }));
    };

    // گوش دادن به تغییرات display-mode
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setPwaState(prev => ({
        ...prev,
        isStandalone: e.matches,
        isInstalled: e.matches || localStorage.getItem('saydatech-pwa-installed') === 'true'
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const installPWA = async (): Promise<boolean> => {
    if (!pwaState.deferredPrompt) {
      return false;
    }

    try {
      await pwaState.deferredPrompt.prompt();
      const { outcome } = await pwaState.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('saydatech-pwa-installed', 'true');
        setPwaState(prev => ({
          ...prev,
          isInstalled: true,
          deferredPrompt: null,
          isInstallable: false
        }));
        return true;
      }
      
      setPwaState(prev => ({
        ...prev,
        deferredPrompt: null,
        isInstallable: false
      }));
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  };

  const canShowInstallPrompt = (): boolean => {
    const hasSeenGuide = localStorage.getItem('saydatech-pwa-guide-seen') === 'true';
    
    // برای تست، همیشه true برگردان (موقت)
    if (process.env.NODE_ENV === 'development') {
      return !hasSeenGuide && !pwaState.isInstalled;
    }
    
    // در production، فقط اگر installable باشد
    return pwaState.isInstallable && !hasSeenGuide && !pwaState.isInstalled;
  };

  const markGuideAsSeen = () => {
    localStorage.setItem('saydatech-pwa-guide-seen', 'true');
  };

  return {
    ...pwaState,
    installPWA,
    canShowInstallPrompt,
    markGuideAsSeen
  };
};
