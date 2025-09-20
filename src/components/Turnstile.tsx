import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  onLoad?: () => void;
  siteKey: string;
  fallbackAvailable?: boolean;
  onFallbackRequest?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
    };
  }
}

export const TurnstileComponent: React.FC<TurnstileProps> = ({
  onVerify,
  onError,
  onExpire,
  onLoad,
  siteKey,
  fallbackAvailable = false,
  onFallbackRequest,
  className = ""
}) => {
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
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
    console.error('Turnstile error:', error);
    setHasError(true);
    if (onError) {
      onError(error);
    }
  };

  const handleExpire = () => {
    console.log('Turnstile expired');
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
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  useEffect(() => {
    // Load Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (turnstileRef.current && window.turnstile) {
        try {
          const widgetId = window.turnstile.render(turnstileRef.current, {
            sitekey: siteKey,
            callback: handleVerify,
            'error-callback': handleError,
            'expired-callback': handleExpire,
            'timeout-callback': handleError,
          });
          widgetIdRef.current = widgetId;
          handleLoad();
        } catch (error) {
          console.error('Failed to render Turnstile:', error);
          handleError(error);
        }
      }
    };

    script.onerror = () => {
      console.error('Failed to load Turnstile script');
      handleError('Failed to load Turnstile script');
    };

    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [siteKey]);

  // If fallback is requested, show fallback UI
  if (showFallback) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert>
          <AlertDescription>
            Turnstile در حال حاضر در دسترس نیست. لطفاً از روش جایگزین استفاده کنید.
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
            خطا در بارگذاری Turnstile. لطفاً دوباره تلاش کنید یا از روش جایگزین استفاده کنید.
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
    <div className={`space-y-4 ${className}`}>
      <div ref={turnstileRef} className="flex justify-center" />
      {!isLoaded && (
        <div className="text-center text-sm text-muted-foreground">
          در حال بارگذاری Turnstile...
        </div>
      )}
    </div>
  );
};

export default TurnstileComponent;
