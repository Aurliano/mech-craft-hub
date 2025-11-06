import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Info, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useLogin, useLoginWithCaptcha } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";
import TurnstileCaptcha from "@/components/TurnstileCaptcha";
import ErrorDisplay from "@/components/ErrorDisplay";
import { refreshCSRFToken } from "@/lib/csrfProtection";
import { navigateToDashboard } from "@/lib/navigation";

const Login = () => {
  const navigate = useNavigate();
  const { mutateAsync: login, isPending, error } = useLogin();
  const { mutateAsync: loginWithCaptcha, isPending: isCaptchaPending, error: captchaError } = useLoginWithCaptcha();
  const { isAuthenticated, user } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Redirect if already authenticated (respect role)
  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Use proper navigation utility
      navigateToDashboard(user, navigate);
    }
  }, [isAuthenticated, user, navigate]);

  // Initialize CSRF token
  React.useEffect(() => {
    const initializeCSRF = async () => {
      try {
        await refreshCSRFToken();
      } catch (error) {
        console.error('Failed to initialize CSRF token:', error);
      }
    };
    initializeCSRF();
  }, []);

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setIsCaptchaVerified(true);
  };

  const performLogin = async () => {
    const loginData = {
      username,
      password,
    };

    // Since Turnstile is disabled, always use regular login
    try {
      await login({ username, password });
      // Login successful, user data will be loaded by AuthContext
      // The redirect will happen in the useEffect above when user data is available
    } catch (err) {
      // Error is handled by the hook
    }
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
      <Navbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">ورود به حساب کاربری</CardTitle>
            <CardDescription>برای ادامه، لطفاً وارد حساب کاربری خود شوید</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">نام کاربری (شماره همراه)</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="text-right" 
                  placeholder="09123456789"
                  required 
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>لطفاً از شماره همراه خود به عنوان نام کاربری استفاده کنید</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="text-right pr-10" 
                    placeholder="رمز عبور خود را وارد کنید"
                    required 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>لطفاً کیبورد خود را روی حالت انگلیسی قرار دهید</span>
                </div>
              </div>

              {/* Turnstile Captcha - Temporarily disabled */}
              {/* <TurnstileCaptcha onVerify={handleCaptchaVerify} /> */}

              <ErrorDisplay 
                error={currentError} 
                onRetry={() => window.location.reload()}
                showDismiss={false}
              />

              <div className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  فراموشی رمز عبور؟
                </Link>
              </div>
              
              <Button 
                className="w-full" 
                variant="hero" 
                type="submit" 
                disabled={isPendingAny}
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