import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Info, AlertCircle, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useLogin, useLoginWithCaptcha } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";
// import TurnstileCaptcha from "@/components/TurnstileCaptcha";
import ErrorDisplay from "@/components/ErrorDisplay";
import { refreshCSRFToken } from "@/lib/csrfProtection";
import { navigateToDashboard } from "@/lib/navigation";
import { passwordResetRequestSMS, verifyPasswordResetSMS, passwordResetConfirmSMS } from "@/lib/api";

type ViewMode = 'login' | 'recovery';
type RecoveryStep = 'input' | 'verify' | 'reset';

const Login = () => {
  const navigate = useNavigate();
  const { mutateAsync: login, isPending, error } = useLogin();
  const { mutateAsync: loginWithCaptcha, isPending: isCaptchaPending, error: captchaError } = useLoginWithCaptcha();
  const { isAuthenticated, user } = useAuth();

  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Recovery State
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('input');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState(""); // Email or Phone
  const [recoveryPhone, setRecoveryPhone] = useState(""); // Returned from API
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigateToDashboard(user, navigate);
    }
  }, [isAuthenticated, user, navigate]);

  // Initialize CSRF token
  useEffect(() => {
    const initializeCSRF = async () => {
      try {
        await refreshCSRFToken();
      } catch (error) {
        console.error('Failed to initialize CSRF token:', error);
      }
    };
    initializeCSRF();
  }, []);

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const performLogin = async () => {
    try {
      await login({ username, password });
    } catch (err) {
      // Error is handled by the hook
    }
  };

  async function onLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    await performLogin();
  }

  /* --- Recovery Flow Handlers --- */

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier) {
      setRecoveryError("لطفاً ایمیل یا شماره همراه خود را وارد کنید");
      return;
    }

    setRecoveryLoading(true);
    setRecoveryError("");
    setRecoveryMessage("");

    try {
      const response = await passwordResetRequestSMS(recoveryIdentifier);
      setRecoveryMessage(response.detail);
      setRecoveryPhone(response.phone || "");
      setRecoveryStep('verify');
      setCountdown(600); // 10 minutes
      if (response.code) {
        console.log('Dev Code:', response.code);
      }
    } catch (err: any) {
      setRecoveryError(err.message || "خطا در ارسال کد بازیابی");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode || recoveryCode.length !== 6) {
      setRecoveryError("لطفاً کد 6 رقمی معتبر وارد کنید");
      return;
    }

    setRecoveryLoading(true);
    setRecoveryError("");

    try {
      await verifyPasswordResetSMS(recoveryCode);
      setRecoveryMessage("کد تأیید شد");
      setRecoveryStep('reset');
    } catch (err: any) {
      setRecoveryError(err.message || "کد تأیید نامعتبر است");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setRecoveryError("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }
    if (newPassword.length < 8) {
      setRecoveryError("رمز عبور باید حداقل 8 کاراکتر باشد");
      return;
    }

    setRecoveryLoading(true);
    setRecoveryError("");

    try {
      await passwordResetConfirmSMS(recoveryCode, newPassword);
      setRecoveryMessage("رمز عبور با موفقیت تغییر کرد. لطفاً وارد شوید.");
      // Reset state and go to login after a delay
      setTimeout(() => {
        resetRecoveryState();
        setViewMode('login');
      }, 2000);
    } catch (err: any) {
      setRecoveryError(err.message || "خطا در تغییر رمز عبور");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const resetRecoveryState = () => {
    setRecoveryStep('input');
    setRecoveryIdentifier("");
    setRecoveryPhone("");
    setRecoveryCode("");
    setNewPassword("");
    setConfirmPassword("");
    setRecoveryError("");
    setRecoveryMessage("");
    setCountdown(0);
  };

  const switchToLogin = () => {
    resetRecoveryState();
    setViewMode('login');
  };

  const currentLoginError = error || captchaError;
  const isPendingAny = isPending || isCaptchaPending;

  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md transition-all duration-300">

          {/* Header */}
          <CardHeader className="text-center">
            {viewMode === 'login' ? (
              <>
                <CardTitle className="text-2xl font-bold">ورود به حساب کاربری</CardTitle>
                <CardDescription>برای ادامه، لطفاً وارد حساب کاربری خود شوید</CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl font-bold">بازیابی رمز عبور</CardTitle>
                <CardDescription>
                  {recoveryStep === 'input' && "شماره همراه یا ایمیل خود را وارد کنید"}
                  {recoveryStep === 'verify' && "کد ارسال شده را وارد کنید"}
                  {recoveryStep === 'reset' && "رمز عبور جدید خود را تعیین کنید"}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {/* LOGIN VIEW */}
            {viewMode === 'login' && (
              <form className="space-y-4" onSubmit={onLoginSubmit}>
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
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>لطفاً کیبورد خود را روی حالت انگلیسی قرار دهید</span>
                  </div>
                </div>

                <ErrorDisplay
                  error={currentLoginError}
                  onRetry={() => window.location.reload()}
                  showDismiss={false}
                />

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryMessage("");
                      setViewMode('recovery');
                    }}
                    className="text-sm text-primary hover:underline bg-transparent border-none cursor-pointer"
                  >
                    فراموشی رمز عبور؟
                  </button>
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
            )}

            {/* RECOVERY VIEW */}
            {viewMode === 'recovery' && (
              <div className="space-y-4">
                {/* Step 1: Input */}
                {recoveryStep === 'input' && (
                  <form onSubmit={handleRecoveryRequest} className="space-y-4">
                    <div className="space-y-2">
                      <Label>ایمیل یا شماره همراه</Label>
                      <Input
                        value={recoveryIdentifier}
                        onChange={(e) => setRecoveryIdentifier(e.target.value)}
                        placeholder="example@mail.com / 0912..."
                        className="text-left"
                        dir="ltr"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={recoveryLoading}>
                      {recoveryLoading ? "در حال پردازش..." : "دریافت کد تایید"}
                    </Button>
                  </form>
                )}

                {/* Step 2: Verify */}
                {recoveryStep === 'verify' && (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">
                        کد ارسال شده به {recoveryPhone || recoveryIdentifier} را وارد کنید
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>کد تایید</Label>
                      <Input
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        className="text-center text-lg tracking-widest"
                        dir="ltr"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={recoveryLoading}>
                      {recoveryLoading ? "بررسی کد..." : "تایید کد"}
                    </Button>
                    <div className="text-center text-sm">
                      {countdown > 0 ? (
                        <span className="text-muted-foreground">ارسال مجدد تا {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRecoveryRequest}
                          className="text-primary hover:underline"
                          disabled={recoveryLoading}
                        >
                          ارسال مجدد کد
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {/* Step 3: Reset */}
                {recoveryStep === 'reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label>رمز عبور جدید</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="text-right pr-10"
                          required
                          minLength={8}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>تکرار رمز عبور جدید</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="text-right pr-10"
                          required
                          minLength={8}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" variant="hero" disabled={recoveryLoading}>
                      {recoveryLoading ? "در حال تغییر رمز..." : "تغییر رمز عبور"}
                    </Button>
                  </form>
                )}

                {/* Common Recovery Footer */}
                <div className="mt-4 space-y-2">
                  {recoveryError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{recoveryError}</AlertDescription>
                    </Alert>
                  )}
                  {recoveryMessage && (
                    <Alert className="border-green-500 text-green-700 bg-green-50">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>{recoveryMessage}</AlertDescription>
                    </Alert>
                  )}

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={switchToLogin}
                      className="flex items-center justify-center w-full gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowRight className="h-4 w-4" />
                      بازگشت به صفحه ورود
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;