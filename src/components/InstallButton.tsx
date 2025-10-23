import { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

interface InstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showIcon?: boolean;
}

const InstallButton = ({ 
  variant = 'outline', 
  size = 'sm', 
  className = '',
  showIcon = true 
}: InstallButtonProps) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const { isInstallable, isInstalled, installPWA, browserInfo } = usePWA();

  const handleInstall = async () => {
    if (!isInstallable) return;
    
    setIsInstalling(true);
    try {
      await installPWA();
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // اگر قبلاً نصب شده یا قابل نصب نیست، دکمه را نمایش نده
  if (isInstalled || !isInstallable) {
    return null;
  }

  const getButtonText = () => {
    if (isInstalling) return 'در حال نصب...';
    
    if (browserInfo?.isDesktop) {
      return 'نصب اپلیکیشن';
    } else {
      return 'افزودن به صفحه اصلی';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleInstall}
      disabled={isInstalling}
      className={`flex items-center gap-2 ${className}`}
    >
      {showIcon && (
        isInstalling ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          browserInfo?.isDesktop ? <Download className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />
        )
      )}
      {getButtonText()}
    </Button>
  );
};

export default InstallButton;
