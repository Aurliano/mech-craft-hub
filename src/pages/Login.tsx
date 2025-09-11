import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthNavbar from "@/components/AuthNavbar";
import { useLogin, useLoginWithCaptcha, useFallbackCaptchaStatus, useFallbackCaptchaChallenge, useVerifyFallbackCaptcha } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";
import HCaptchaComponent from "@/components/HCaptcha";
import LocalCaptcha from "@/components/LocalCaptcha";

const Login = () => {
  const navigate = useNavigate();
  const { mutateAsync: login, isPending, error } = useLogin();
  const { mutateAsync: loginWithCaptcha, isPending: isCaptchaPending, error: captchaError } = useLoginWithCaptcha();
  const { isAuthenticated } = useAuth();
  const { data: fallbackStatus } = useFallbackCaptchaStatus();
  const { mutateAsync: getChallenge, isPending: isChallengePending } = useFallbackCaptchaChallenge();
  const { mutateAsync: verifyFallback, isPending: isVerifyingFallback } = useVerifyFallbackCaptcha();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackChallenge, setFallbackChallenge] = useState<{ id: string; question: string } | null>(null);
  const [fallbackAnswer, setFallbackAnswer] = useState("");
  const [showFallback, setShowFallback] = useState(false);

  const hcaptchaRef = useRef<any>(null);

  // Get hCaptcha site key from environment
  const hcaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Check if fallback is available
  React.useEffect(() => {
    if (fallbackStatus?.available && !hcaptchaSiteKey) {
      setUseFallback(true);
    }
  }, [fallbackStatus, hcaptchaSiteKey]);

  const handleCaptchaVerify = (token: string) => {
    setHcaptchaToken(token);
  };

  const handleCaptchaError = (error: any) => {
    console.error('hCaptcha error:', error);
    if (fallbackStatus?.available) {
      setShowFallback(true);
    }
  };

  const handleFallbackRequest = async () => {
    try {
      const challenge = await getChallenge();
      setFallbackChallenge({
        id: challenge.challenge_id,
        question: challenge.challenge
      });
      setUseFallback(true);
    } catch (err) {
      console.error('Failed to get fallback challenge:', err);
    }
  };

  const handleFallbackVerify = async (answer: string) => {
    if (!fallbackChallenge) return;
    
    try {
      const result = await verifyFallback({ challengeId: fallbackChallenge.id, answer });
      if (result.success) {
        // Fallback captcha verified, proceed with login
        await performLogin();
      } else {
        throw new Error(result.message || 'کپچای محلی ناموفق بود');
      }
    } catch (err) {
      console.error('Fallback captcha verification failed:', err);
      throw err;
    }
  };

  const performLogin = async () => {
    if (hcaptchaToken) {
      await loginWithCaptcha({ username, password, hcaptcha_token: hcaptchaToken });
    } else {
      await login({ username, password });
    }
    navigate("/dashboard");
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (useFallback && fallbackChallenge) {
        await handleFallbackVerify(fallbackAnswer);
      } else if (hcaptchaToken) {
        await performLogin();
      } else {
        // Try regular login without captcha
        await login({ username, password });
        navigate("/dashboard");
      }
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const currentError = error || captchaError;
  const isPendingAny = isPending || isCaptchaPending || isVerifyingFallback;

  return (
    <div className="min-h-screen" dir="rtl">
      <AuthNavbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">ورود به حساب کاربری</CardTitle>
            <CardDescription>برای ادامه، لطفاً وارد حساب کاربری خود شوید</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">نام کاربری</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="text-right" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="text-right" 
                  required 
                />
              </div>

              {/* hCaptcha or Fallback Captcha */}
              {!useFallback && hcaptchaSiteKey && (
                <HCaptchaComponent
                  siteKey={hcaptchaSiteKey}
                  onVerify={handleCaptchaVerify}
                  onError={handleCaptchaError}
                  fallbackAvailable={fallbackStatus?.available || false}
                  onFallbackRequest={handleFallbackRequest}
                />
              )}

              {useFallback && (
                <LocalCaptcha
                  challenge={fallbackChallenge}
                  onVerify={handleFallbackVerify}
                  onRequestChallenge={handleFallbackRequest}
                />
              )}

              {showFallback && !useFallback && (
                <Alert>
                  <AlertDescription>
                    hCaptcha در دسترس نیست. لطفاً از کپچای محلی استفاده کنید.
                  </AlertDescription>
                </Alert>
              )}

              {currentError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {currentError instanceof Error ? currentError.message : 'خطا در ورود'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  فراموشی رمز عبور؟
                </Link>
              </div>
              
              <Button 
                className="w-full" 
                variant="hero" 
                type="submit" 
                disabled={isPendingAny || (!hcaptchaToken && !useFallback && hcaptchaSiteKey)}
              >
                {isPendingAny ? "در حال ورود..." : "ورود"}
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  حساب کاربری ندارید؟{" "}
                  <Link to="/register" className="text-primary hover:underline">
                    ثبت نام کنید
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;