import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import AuthNavbar from "@/components/AuthNavbar";
import { useRegister, usePhoneVerificationRequest, useRegisterWithCaptcha, useFallbackCaptchaStatus, useFallbackCaptchaChallenge, useVerifyFallbackCaptcha } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";
import HCaptchaComponent from "@/components/HCaptcha";
import LocalCaptcha from "@/components/LocalCaptcha";
import TermsAndConditions from "@/components/TermsAndConditions";
import { useScopes, useServices } from "@/hooks/useAuth";

const ContractorRegister = () => {
  const navigate = useNavigate();
  const { mutateAsync: register, isPending, error } = useRegister();
  const { mutateAsync: registerWithCaptcha, isPending: isCaptchaPending, error: captchaError } = useRegisterWithCaptcha();
  const { mutateAsync: requestVerification, isPending: isVerifying } = usePhoneVerificationRequest();
  const { isAuthenticated } = useAuth();
  const { data: fallbackStatus } = useFallbackCaptchaStatus();
  const { mutateAsync: getChallenge, isPending: isChallengePending } = useFallbackCaptchaChallenge();
  const { mutateAsync: verifyFallback, isPending: isVerifyingFallback } = useVerifyFallbackCaptcha();
  
  // Get scopes and services
  const { data: scopes } = useScopes();
  const [selectedScopeId, setSelectedScopeId] = useState<string>("");
  const { data: services } = useServices(selectedScopeId);
  
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
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
      navigate("/contractor-dashboard");
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
    const userData = {
      username: phone, // Use phone as username
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password,
      role: 'contractor', // Set role as contractor
      selected_scope: selectedScopeId,
      selected_services: selectedServices
    };

    if (hcaptchaToken) {
      await registerWithCaptcha({ ...userData, hcaptcha_token: hcaptchaToken });
    } else {
      await register(userData);
    }
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
    if (!selectedScopeId) {
      alert("لطفا زمینه فعالیت را انتخاب کنید");
      return;
    }
    if (selectedServices.length === 0) {
      alert("لطفا حداقل یک سرویس را انتخاب کنید");
      return;
    }
    
    try {
      if (useFallback && fallbackChallenge) {
        await handleFallbackVerify(fallbackAnswer);
      } else if (hcaptchaToken) {
        await performRegistration();
      } else {
        // Try regular registration without captcha
        await performRegistration();
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
      navigate("/contractor-dashboard");
    }
  }, [isAuthenticated, showPhoneVerification, navigate]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <AuthNavbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">ثبت نام پیمانکار</CardTitle>
            <CardDescription>حساب کاربری پیمانکار ایجاد کنید</CardDescription>
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
                  <Label htmlFor="password">رمز عبور *</Label>
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
                  <Label htmlFor="confirmPassword">تکرار رمز عبور *</Label>
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

                {/* Scope Selection */}
                <div className="space-y-2">
                  <Label htmlFor="scope">زمینه فعالیت *</Label>
                  <Select value={selectedScopeId} onValueChange={setSelectedScopeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="زمینه فعالیت خود را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {scopes?.map((scope) => (
                        <SelectItem key={scope.id} value={scope.id}>
                          {scope.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Services Selection */}
                {selectedScopeId && services && (
                  <div className="space-y-2">
                    <Label>خدمات قابل ارائه *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {services.map((service) => (
                        <div key={service.id} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={service.id}
                            checked={selectedServices.includes(service.id)}
                            onCheckedChange={() => handleServiceToggle(service.id)}
                          />
                          <Label htmlFor={service.id} className="text-sm">
                            {service.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      حداقل یک سرویس را انتخاب کنید
                    </p>
                  </div>
                )}

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
                  disabled={isPending || isVerifying || isCaptchaPending || isVerifyingFallback || (!hcaptchaToken && !useFallback && hcaptchaSiteKey)}
                >
                  {isPending || isVerifying || isCaptchaPending || isVerifyingFallback ? "در حال ثبت‌نام..." : "ثبت نام پیمانکار"}
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

export default ContractorRegister;
