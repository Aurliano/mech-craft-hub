import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthNavbar from "@/components/AuthNavbar";
import { useRegister, usePhoneVerificationRequest, useRegisterWithCaptcha, useFallbackCaptchaStatus, useFallbackCaptchaChallenge, useVerifyFallbackCaptcha } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";
import HCaptchaComponent from "@/components/HCaptcha";
import LocalCaptcha from "@/components/LocalCaptcha";

const Register = () => {
  const navigate = useNavigate();
  const { mutateAsync: register, isPending, error } = useRegister();
  const { mutateAsync: registerWithCaptcha, isPending: isCaptchaPending, error: captchaError } = useRegisterWithCaptcha();
  const { mutateAsync: requestVerification, isPending: isVerifying } = usePhoneVerificationRequest();
  const { isAuthenticated } = useAuth();
  const { data: fallbackStatus } = useFallbackCaptchaStatus();
  const { mutateAsync: getChallenge, isPending: isChallengePending } = useFallbackCaptchaChallenge();
  const { mutateAsync: verifyFallback, isPending: isVerifyingFallback } = useVerifyFallbackCaptcha();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
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
        // Fallback captcha verified, proceed with registration
        await performRegistration();
      } else {
        throw new Error(result.message || 'کپچای محلی ناموفق بود');
      }
    } catch (err) {
      console.error('Fallback captcha verification failed:', err);
      throw err;
    }
  };

  const performRegistration = async () => {
    if (hcaptchaToken) {
      await registerWithCaptcha({ username, email, phone, password, hcaptcha_token: hcaptchaToken });
    } else {
      await register({ username, email, phone, password });
    }
    // After successful registration, request phone verification
    await requestVerification(phone);
    setShowPhoneVerification(true);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return;
    
    try {
      if (useFallback && fallbackChallenge) {
        await handleFallbackVerify(fallbackAnswer);
      } else if (hcaptchaToken) {
        await performRegistration();
      } else {
        // Try regular registration without captcha
        await register({ username, email, phone, password });
        await requestVerification(phone);
        setShowPhoneVerification(true);
      }
    } catch (err) {
      // Error is handled by the hook
    }
  }

  function handlePhoneVerification() {
    navigate("/phone-verification", { state: { phone } });
  }

  // Redirect after successful phone verification
  React.useEffect(() => {
    if (isAuthenticated && showPhoneVerification) { 
      navigate("/dashboard");
    }
  }, [isAuthenticated, showPhoneVerification, navigate]);

  return (
    <div className="min-h-screen" dir="rtl">
      <AuthNavbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">ثبت نام</CardTitle>
            <CardDescription>حساب کاربری جدید ایجاد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            {showPhoneVerification ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    ثبت‌نام با موفقیت انجام شد! کد تأیید به شماره {phone} ارسال شد.
                  </AlertDescription>
                </Alert>
                <Button className="w-full" variant="hero" onClick={handlePhoneVerification}>
                  تأیید شماره تلفن
                </Button>
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    قبلاً حساب کاربری دارید؟{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      وارد شوید
                    </Link>
                  </span>
                </div>
              </div>
            ) : (
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
                  <Label htmlFor="email">ایمیل</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="text-right" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">تلفن</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="text-right" 
                    placeholder="09123456789" 
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
                    minLength={8} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirm} 
                    onChange={(e) => setConfirm(e.target.value)} 
                    className="text-right" 
                    required 
                    minLength={8} 
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

                {password !== confirm && confirm ? (
                  <Alert variant="destructive">
                    <AlertDescription>رمزهای عبور مطابقت ندارند</AlertDescription>
                  </Alert>
                ) : null}

                {(error || captchaError) && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {error instanceof Error ? error.message : 
                       captchaError instanceof Error ? captchaError.message : 
                       'ثبت‌نام با خطا مواجه شد'}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  className="w-full" 
                  variant="hero" 
                  type="submit" 
                  disabled={isPending || isVerifying || isCaptchaPending || isVerifyingFallback || (!hcaptchaToken && !useFallback && hcaptchaSiteKey)}
                >
                  {isPending || isVerifying || isCaptchaPending || isVerifyingFallback ? "در حال ثبت‌نام..." : "ثبت نام"}
                </Button>
                
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    قبلاً حساب کاربری دارید؟{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      وارد شوید
                    </Link>
                  </span>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;