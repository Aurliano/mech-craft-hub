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
import TurnstileCaptcha from "@/components/TurnstileCaptcha";

const Login = () => {
  const navigate = useNavigate();
  const { mutateAsync: login, isPending, error } = useLogin();
  const { mutateAsync: loginWithCaptcha, isPending: isCaptchaPending, error: captchaError } = useLoginWithCaptcha();
  const { isAuthenticated } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setIsCaptchaVerified(true);
  };

  const performLogin = async () => {
    const loginData = {
      username,
      password,
      cf_turnstile_response: captchaToken
    };

    if (captchaToken) {
      await loginWithCaptcha({ ...loginData, turnstile_token: captchaToken });
    } else {
      await login(loginData);
    }
    
    // Clear token after use
    setCaptchaToken(null);
    navigate("/dashboard");
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      await performLogin();
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const currentError = error || captchaError;
  const isPendingAny = isPending || isCaptchaPending;

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

              {/* Turnstile Captcha */}
              <TurnstileCaptcha onVerify={handleCaptchaVerify} />

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
                disabled={isPendingAny || !isCaptchaVerified}
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