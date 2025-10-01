import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import { useRegister, usePhoneVerificationRequest, useRegisterWithCaptcha } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";
import TurnstileCaptcha from "@/components/TurnstileCaptcha";
import TermsAndConditions from "@/components/TermsAndConditions";

const Register = () => {
  const navigate = useNavigate();
  const { mutateAsync: register, isPending, error } = useRegister();
  const { mutateAsync: registerWithCaptcha, isPending: isCaptchaPending, error: captchaError } = useRegisterWithCaptcha();
  const { mutateAsync: requestVerification, isPending: isVerifying } = usePhoneVerificationRequest();
  const { isAuthenticated } = useAuth();
  
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
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

  const performRegistration = async () => {
    const userData = {
      username: phone, // Use phone as username
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password,
      role: 'customer', // Set role as customer
      cf_turnstile_response: captchaToken // Add Turnstile token
    };

    if (captchaToken) {
      await registerWithCaptcha({ ...userData, turnstile_token: captchaToken });
    } else {
      await register(userData);
    }
    
    // Clear token after use
    setCaptchaToken(null);
    
    // After successful registration, request phone verification
    await requestVerification(phone);
    setShowPhoneVerification(true);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return;
    if (!acceptTerms) {
      alert("لطفا قوانین و شرایط را بپذیرید");
      return;
    }
    
    try {
      await performRegistration();
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
      <Navbar />
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
                  <Label htmlFor="phone">شماره همراه *</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="text-right" 
                    placeholder="09123456789" 
                    required 
                  />
                  <p className="text-xs text-muted-foreground">شماره همراه شما به عنوان نام کاربری استفاده خواهد شد</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">نام *</Label>
                    <Input 
                      id="firstName" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      className="text-right" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">نام خانوادگی *</Label>
                    <Input 
                      id="lastName" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      className="text-right" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل *</Label>
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

                {/* Turnstile Captcha */}
                <TurnstileCaptcha onVerify={handleCaptchaVerify} />

                {/* Honeypot field - hidden from users */}
                <div style={{ display: 'none' }}>
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website"
                    name="website" 
                    type="text" 
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Terms and Conditions */}
                <TermsAndConditions
                  checked={acceptTerms}
                  onCheckedChange={setAcceptTerms}
                  error={!acceptTerms ? "لطفا قوانین و شرایط را بپذیرید" : undefined}
                />

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
                  disabled={isPending || isVerifying || isCaptchaPending || !isCaptchaVerified || !acceptTerms}
                >
                  {isPending || isVerifying || isCaptchaPending ? "در حال ثبت‌نام..." : "ثبت نام"}
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