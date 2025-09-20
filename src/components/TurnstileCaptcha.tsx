import React, { useEffect, useRef, useState } from "react";
import LocalCaptcha from "./LocalCaptcha";

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  fallbackApi?: string;
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
  fallbackApi = "/api/v1/captcha/fallback/" 
}: TurnstileCaptchaProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"unknown" | "turnstile" | "local">("unknown");
  const [fallbackChallenge, setFallbackChallenge] = useState<{ id: string; question: string } | null>(null);

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
        }
      })
      .catch(() => setMode("turnstile"));
    
    return () => { 
      cancelled = true; 
    };
  }, [fallbackApi]);

  useEffect(() => {
    if (mode !== "turnstile") return;
    
    const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY;
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
      script.onload = renderWidget;
    } else {
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
      } catch(_) {}
    };
  }, [mode, onVerify]);

  const handleLocalCaptchaRequest = async () => {
    try {
      const response = await fetch('/api/v1/captcha/challenge/', { credentials: 'include' });
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
    return <div className="text-center text-muted-foreground">در حال بررسی کپچا…</div>;
  }
  
  if (mode === "local") {
    return (
      <LocalCaptcha
        challenge={fallbackChallenge}
        onVerify={handleLocalCaptchaVerify}
        onRequestChallenge={handleLocalCaptchaRequest}
      />
    );
  }
  
  return <div ref={widgetRef} aria-label="turnstile-captcha" className="flex justify-center" />;
}