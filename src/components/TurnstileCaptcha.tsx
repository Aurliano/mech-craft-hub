import React, { useEffect, useRef, useState } from "react";
import LocalCaptcha from "./LocalCaptcha";

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  fallbackApi?: string;
  timeout?: number; // Timeout in milliseconds
  siteKey?: string; // Optional site key override
}

declare global {
  interface Window {
    turnstile?: {
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
  fallbackApi = "/api/v1/captcha/fallback/",
  timeout = 10000, // 10 seconds default
  siteKey
}: TurnstileCaptchaProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"unknown" | "turnstile" | "local">("unknown");
  const [fallbackChallenge, setFallbackChallenge] = useState<{ id: string; question: string } | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check fallback first
    let cancelled = false;
    fetch(fallbackApi, { credentials: 'include' })
      .then(r => r.json())
      .then(j => {
        if (cancelled) return;
        if (j && j.fallback === "local") {
          setMode("local");
        } else {
          setMode("turnstile");
          // Start timeout for Turnstile loading
          timeoutRef.current = setTimeout(() => {
            if (!turnstileLoaded) {
              console.log("Turnstile timeout reached, switching to fallback");
              setTimeoutReached(true);
              setMode("local");
            }
          }, timeout);
        }
      })
      .catch(() => {
        setMode("turnstile");
        // Start timeout for Turnstile loading
        timeoutRef.current = setTimeout(() => {
          if (!turnstileLoaded) {
            console.log("Turnstile timeout reached, switching to fallback");
            setTimeoutReached(true);
            setMode("local");
          }
        }, timeout);
      });
    
    return () => { 
      cancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fallbackApi, timeout, turnstileLoaded]);

  useEffect(() => {
    if (mode !== "turnstile") return;
    
    const SITEKEY = siteKey || import.meta.env.VITE_TURNSTILE_SITEKEY;
    if (!SITEKEY) {
      console.error("TURNSTILE: VITE_TURNSTILE_SITEKEY is not set");
      setMode("local");
      return;
    }

    // Load script if needed
    if (!window.turnstile) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = () => {
        setTurnstileLoaded(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        renderWidget();
      };
      script.onerror = () => {
        console.error("Failed to load Turnstile script");
        setMode("local");
      };
    } else {
      setTurnstileLoaded(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      renderWidget();
    }

    function renderWidget() {
      if (!widgetRef.current) return;
      
      try {
        // Clear container
        widgetRef.current.innerHTML = "";
        
        window.turnstile?.render(widgetRef.current, {
          sitekey: SITEKEY,
          callback: (token) => {
            onVerify && onVerify(token);
          },
          "error-callback": () => {
            // If widget errors -> fallback to local
            console.log("Turnstile widget error, switching to fallback");
            setMode("local");
          }
        });
      } catch (e) {
        console.error("Turnstile render failed", e);
        setMode("local");
      }
    }

    // Cleanup on unmount
    return () => {
      try { 
        if (widgetRef.current) {
          widgetRef.current.innerHTML = ""; 
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } catch(_) {}
    };
  }, [mode, onVerify, siteKey]);

  const handleLocalCaptchaRequest = async () => {
    try {
      const response = await fetch('/api/v1/captcha/fallback/', { credentials: 'include' });
      const data = await response.json();
      setFallbackChallenge({
        id: data.challenge_id,
        question: data.challenge
      });
    } catch (err) {
      console.error('Failed to get fallback challenge:', err);
    }
  };

  const handleLocalCaptchaVerify = async (answer: string) => {
    if (!fallbackChallenge) return;
    
    try {
      const response = await fetch('/api/v1/captcha/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: fallbackChallenge.id,
          answer: answer
        }),
        credentials: 'include'
      });
      
      const result = await response.json();
      if (result.success) {
        // Use challenge_id as token for local captcha
        onVerify(fallbackChallenge.id);
      } else {
        throw new Error(result.message || 'کپچای محلی ناموفق بود');
      }
    } catch (err) {
      console.error('Local captcha verification failed:', err);
      throw err;
    }
  };

  if (mode === "unknown") {
    return (
      <div className="text-center text-muted-foreground p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
        در حال بررسی کپچا…
      </div>
    );
  }
  
  if (mode === "local") {
    return (
      <div className="space-y-2">
        {timeoutReached && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border">
            ⚠️ Turnstile در دسترس نیست، از کپچای محلی استفاده می‌شود
          </div>
        )}
        <LocalCaptcha
          challenge={fallbackChallenge}
          onVerify={handleLocalCaptchaVerify}
          onRequestChallenge={handleLocalCaptchaRequest}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div ref={widgetRef} aria-label="turnstile-captcha" className="flex justify-center" />
      {!turnstileLoaded && (
        <div className="text-center text-muted-foreground text-sm">
          در حال بارگذاری Turnstile...
        </div>
      )}
    </div>
  );
}