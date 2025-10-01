import React, { useEffect, useRef, useState } from "react";

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  timeout?: number; // Timeout in milliseconds
  siteKey?: string; // Optional site key override
}

declare global {
  interface Window {
    Turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback': () => void;
      }) => void;
      reset: (widget?: string) => void;
    };
  }
}

export default function TurnstileCaptcha({ 
  onVerify, 
  timeout = 30000, // 30 seconds default
  siteKey
}: TurnstileCaptchaProps) {
  
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Turnstile is available
    const SITEKEY = siteKey || import.meta.env.VITE_TURNSTILE_SITEKEY;
    
    if (SITEKEY && SITEKEY !== "your-turnstile-site-key" && SITEKEY.startsWith("0x")) {
      // Start timeout for Turnstile loading
      timeoutRef.current = setTimeout(() => {
        if (!turnstileLoaded) {
          console.log("Turnstile timeout reached");
          setTimeoutReached(true);
          setError("Turnstile failed to load. Please refresh the page.");
        }
      }, timeout);

      // Load Turnstile script if not already loaded
      if (!window.Turnstile) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setTurnstileLoaded(true);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Render Turnstile widget
          if (widgetRef.current && window.Turnstile) {
            try {
              window.Turnstile.render(widgetRef.current, {
                sitekey: SITEKEY,
                callback: (token: string) => {
                  onVerify(token);
                },
                'error-callback': () => {
                  setError("Turnstile verification failed. Please try again.");
                }
              });
            } catch (err) {
              console.error("Error rendering Turnstile:", err);
              setError("Failed to load Turnstile. Please refresh the page.");
            }
          }
        };
        script.onerror = () => {
          setError("Failed to load Turnstile. Please check your internet connection.");
        };
        document.head.appendChild(script);
      } else {
        // Turnstile already loaded
        setTurnstileLoaded(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Render Turnstile widget
        if (widgetRef.current && window.Turnstile) {
          try {
            window.Turnstile.render(widgetRef.current, {
              sitekey: SITEKEY,
              callback: (token: string) => {
                onVerify(token);
              },
              'error-callback': () => {
                setError("Turnstile verification failed. Please try again.");
              }
            });
          } catch (err) {
            console.error("Error rendering Turnstile:", err);
            setError("Failed to load Turnstile. Please refresh the page.");
          }
        }
      }
    } else {
      setError("Turnstile is not properly configured.");
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [siteKey, timeout, turnstileLoaded, onVerify]);

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-700 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (timeoutReached) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md">
        <p className="text-yellow-700 text-sm">
          Turnstile is taking longer than expected to load. Please refresh the page.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-yellow-600 hover:text-yellow-800 text-sm underline"
        >
          Refresh Page
        </button>
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