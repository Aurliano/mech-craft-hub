import React, { useEffect, useRef, useState, useCallback } from "react";

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  timeout?: number; // Timeout in milliseconds
  siteKey?: string; // Optional site key override
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback': () => void;
        'expired-callback': () => void;
        'timeout-callback': () => void;
      }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    turnstileScriptLoaded?: boolean;
    turnstileActiveWidgets?: Set<string>;
  }
}

export default function TurnstileCaptcha({ 
  onVerify, 
  timeout = 30000, // 30 seconds default
  siteKey
}: TurnstileCaptchaProps) {
  
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isRenderingRef = useRef(false);

  const renderWidget = useCallback((siteKey: string) => {
    if (!widgetRef.current || !window.turnstile || widgetIdRef.current || isRenderingRef.current) return;

    isRenderingRef.current = true;
    
    try {
      // Initialize global widget tracking
      if (!window.turnstileActiveWidgets) {
        window.turnstileActiveWidgets = new Set();
      }

      // Remove any existing widgets first
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          window.turnstileActiveWidgets.delete(widgetIdRef.current);
        } catch (err) {
          console.log("Previous widget already removed");
        }
        widgetIdRef.current = null;
      }

      // Clear any existing content
      if (widgetRef.current) {
        widgetRef.current.innerHTML = '';
      }

      const widgetId = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          console.log("Turnstile token received:", token);
          onVerify(token);
        },
        'error-callback': () => {
          console.error("Turnstile error occurred");
          // Don't set error for 400020, just log it
          setError("Turnstile verification failed. Please try again.");
        },
        'expired-callback': () => {
          console.log("Turnstile token expired");
          setError("Turnstile token expired. Please verify again.");
        },
        'timeout-callback': () => {
          console.log("Turnstile timeout occurred");
          setError("Turnstile verification timed out. Please try again.");
        }
      });
      
      widgetIdRef.current = widgetId;
      window.turnstileActiveWidgets.add(widgetId);
      console.log("Turnstile widget rendered with ID:", widgetId);
      console.log("Active widgets:", Array.from(window.turnstileActiveWidgets));
    } catch (err) {
      console.error("Error rendering Turnstile widget:", err);
      setError("Failed to render Turnstile widget.");
    } finally {
      isRenderingRef.current = false;
    }
  }, [onVerify]);

  const loadTurnstileScript = useCallback((siteKey: string) => {
    if (window.turnstileScriptLoaded) return;
    
    window.turnstileScriptLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setTurnstileLoaded(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        renderWidget(siteKey);
      }, 100);
    };
    
    script.onerror = () => {
      window.turnstileScriptLoaded = false;
      setError("Failed to load Turnstile script. Please check your internet connection.");
    };
    
    document.head.appendChild(script);
  }, [renderWidget]);

  useEffect(() => {
    // Temporarily disabled Turnstile
    return;
    
    const SITEKEY = siteKey || import.meta.env.VITE_TURNSTILE_SITEKEY || '0x4AAAAAAB4WRGkdiHvALys6'; // Correct site key
    
    if (!SITEKEY || SITEKEY === "your-turnstile-site-key" || !SITEKEY.startsWith("0x")) {
      setError("Turnstile site key is not properly configured.");
      return;
    }

    // Start timeout
    timeoutRef.current = setTimeout(() => {
      if (!turnstileLoaded) {
        setError("Turnstile failed to load within timeout period.");
      }
    }, timeout);

    // Check if Turnstile is already loaded
    if (window.turnstile && window.turnstileScriptLoaded) {
      setTurnstileLoaded(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        renderWidget(SITEKEY);
      }, 100);
    } else if (!window.turnstileScriptLoaded) {
      // Load Turnstile script
      loadTurnstileScript(SITEKEY);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [siteKey, timeout, turnstileLoaded, loadTurnstileScript, renderWidget]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          if (window.turnstileActiveWidgets) {
            window.turnstileActiveWidgets.delete(widgetIdRef.current);
          }
        } catch (err) {
          console.error("Error removing Turnstile widget:", err);
        }
      }
    };
  }, []);

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-700 text-sm">{error}</p>
        <div className="mt-2 space-x-2">
          <button 
            onClick={() => {
              setError(null);
              setTurnstileLoaded(false);
              widgetIdRef.current = null;
              isRenderingRef.current = false;
              window.location.reload();
            }} 
            className="text-red-600 hover:text-red-800 text-sm underline"
          >
            Refresh Page
          </button>
          <button 
            onClick={() => {
              setError(null);
              setTurnstileLoaded(false);
              widgetIdRef.current = null;
              isRenderingRef.current = false;
            }} 
            className="text-red-600 hover:text-red-800 text-sm underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div ref={widgetRef} className="turnstile-widget" />
      {!turnstileLoaded && (
        <p className="text-sm text-gray-600">Loading Turnstile...</p>
      )}
    </div>
  );
}