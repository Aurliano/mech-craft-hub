import React, { useEffect, useRef, useState } from "react";
import LocalCaptcha from "./LocalCaptcha";
import { getApiUrl } from '@/lib/api';

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  fallbackApi?: string;
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
  fallbackApi = "/api/v1/captcha/fallback/",
  timeout = 30000, // 30 seconds default
  siteKey
}: TurnstileCaptchaProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"unknown" | "turnstile" | "local">("unknown");
  const [fallbackChallenge, setFallbackChallenge] = useState<{ id: string; question: string } | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start with Turnstile first
    let cancelled = false;
    
    // Check if Turnstile is available
    const SITEKEY = siteKey || import.meta.env.VITE_TURNSTILE_SITEKEY;
    if (SITEKEY) {
      setMode("turnstile");
      // Start timeout for Turnstile loading
      timeoutRef.current = setTimeout(() => {
        if (!turnstileLoaded && !cancelled) {
          console.log("Turnstile timeout reached, switching to fallback");
          setTimeoutReached(true);
          setMode("local");
          // Request fallback challenge
          requestFallbackChallenge();
        }
      }, timeout);
    } else {
      // No Turnstile key, go directly to fallback
      setMode("local");
      requestFallbackChallenge();
    }
    
    function requestFallbackChallenge() {
      if (cancelled) return;
      
      const fullUrl = getApiUrl(fallbackApi);
      
      fetch(fullUrl, { 
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(r => {
          if (!r.ok) {
            throw new Error(`HTTP error! status: ${r.status}`);
          }
          return r.json();
        })
        .then(j => {
          if (cancelled) return;
          if (j && j.challenge_id && j.challenge) {
            setFallbackChallenge({
              id: j.challenge_id,
              question: j.challenge
            });
          } else if (j && j.available === false) {
            console.error('Fallback captcha error:', j.error);
          }
        })
        .catch(err => {
          console.error('Failed to get fallback challenge:', err);
        });
    }
    
    return () => { 
      cancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fallbackApi, timeout, turnstileLoaded, siteKey]);

  useEffect(() => {
    if (mode !== "turnstile") return;
    
    const SITEKEY = siteKey || import.meta.env.VITE_TURNSTILE_SITEKEY || "1x00000000000000000000AA";
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
  }, [mode]); // فقط mode را در dependency قرار دادیم

  const handleLocalCaptchaRequest = async () => {
    try {
      const fullUrl = getApiUrl(fallbackApi);
      
      const response = await fetch(fullUrl, { 
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fallback challenge data:', data);
      setFallbackChallenge({
        id: data.challenge_id,
        question: data.challenge
      });
    } catch (err) {
      console.error('Failed to get fallback challenge:', err);
    }
  };

  const handleLocalCaptchaVerify = async (answer: string) => {
    if (!fallbackChallenge) {
      console.error('No fallback challenge available');
      throw new Error('کپچای محلی در دسترس نیست');
    }
    
    try {
      const fullUrl = getApiUrl('/api/v1/captcha/fallback/verify/');
      
      console.log('Verifying fallback captcha:', {
        challenge_id: fallbackChallenge.id,
        answer: answer
      });
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: fallbackChallenge.id,
          answer: answer
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Fallback captcha verification result:', result);
      
      if (result.success) {
        // Use challenge_id as token for local captcha
        onVerify(fallbackChallenge.id);
      } else {
        throw new Error(result.error || 'کپچای محلی ناموفق بود');
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
      <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
        {timeoutReached && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            ⚠️ Turnstile در دسترس نیست، از کپچای محلی استفاده می‌شود
          </div>
        )}
        <div className="text-center text-sm text-gray-600 mb-2">
          لطفاً سوال زیر را پاسخ دهید:
        </div>
        <LocalCaptcha
          challenge={fallbackChallenge}
          onVerify={handleLocalCaptchaVerify}
          onRequestChallenge={handleLocalCaptchaRequest}
          className="bg-white p-3 rounded border"
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