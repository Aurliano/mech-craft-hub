import React, { useRef, useEffect, useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
  onLoad?: () => void;
  siteKey: string;
  fallbackAvailable?: boolean;
  onFallbackRequest?: () => void;
  className?: string;
}

export const HCaptchaComponent: React.FC<HCaptchaComponentProps> = ({
  onVerify,
  onError,
  onExpire,
  onLoad,
  siteKey,
  fallbackAvailable = false,
  onFallbackRequest,
  className = ""
}) => {
  const captchaRef = useRef<HCaptcha>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  const handleVerify = (token: string) => {
    setHasError(false);
    onVerify(token);
  };

  const handleError = (error: any) => {
    console.error('hCaptcha error:', error);
    setHasError(true);
    if (onError) {
      onError(error);
    }
  };

  const handleExpire = () => {
    console.log('hCaptcha expired');
    if (onExpire) {
      onExpire();
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleFallback = () => {
    setShowFallback(true);
    if (onFallbackRequest) {
      onFallbackRequest();
    }
  };

  const resetCaptcha = () => {
    if (captchaRef.current) {
      captchaRef.current.resetCaptcha();
    }
  };

  // If fallback is requested, show fallback UI
  if (showFallback) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert>
          <AlertDescription>
            hCaptcha در حال حاضر در دسترس نیست. لطفاً از روش جایگزین استفاده کنید.
          </AlertDescription>
        </Alert>
        {fallbackAvailable && onFallbackRequest && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleFallback}
            className="w-full"
          >
            استفاده از کپچای محلی
          </Button>
        )}
      </div>
    );
  }

  // If there's an error and fallback is available, show fallback option
  if (hasError && fallbackAvailable && onFallbackRequest) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert variant="destructive">
          <AlertDescription>
            خطا در بارگذاری hCaptcha. لطفاً دوباره تلاش کنید یا از روش جایگزین استفاده کنید.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={resetCaptcha}
            className="flex-1"
          >
            تلاش مجدد
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleFallback}
            className="flex-1"
          >
            کپچای محلی
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        onLoad={handleLoad}
        theme="light"
        size="normal"
      />
      {hasError && (
        <Alert variant="destructive">
          <AlertDescription>
            خطا در بارگذاری کپچا. لطفاً صفحه را رفرش کنید.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default HCaptchaComponent;
