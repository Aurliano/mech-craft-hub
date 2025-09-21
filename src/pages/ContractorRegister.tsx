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
import TurnstileComponent from "@/components/Turnstile";
import LocalCaptcha from "@/components/LocalCaptcha";
import TurnstileCaptcha from "@/components/TurnstileCaptcha";
import TermsAndConditions from "@/components/TermsAndConditions";
import { useScopes, useServices } from "@/hooks/useAuth";

const ContractorRegister = () => {
  const navigate = useNavigate();
  const { mutateAsync: register, isPending, error } = useRegister();
  const { mutateAsync: registerWithCaptcha, isPending: isCaptchaPending, error: registerCaptchaError } = useRegisterWithCaptcha();
  const { mutateAsync: requestVerification, isPending: isVerifying } = usePhoneVerificationRequest();
  const { isAuthenticated } = useAuth();
  const { data: fallbackStatus } = useFallbackCaptchaStatus();
  const { mutateAsync: getChallenge, isPending: isChallengePending } = useFallbackCaptchaChallenge();
  const { mutateAsync: verifyFallback, isPending: isVerifyingFallback } = useVerifyFallbackCaptcha();
  
  // Get scopes and services
  const { data: scopes } = useScopes();
  const [selectedScopeId, setSelectedScopeId] = useState<string>("");
  const { data: services } = useServices(selectedScopeId || undefined);
  
  // Reset selected services when scope changes
  React.useEffect(() => {
    setSelectedServices([]);
  }, [selectedScopeId]);
  
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackChallenge, setFallbackChallenge] = useState<{ id: string; question: string } | null>(null);
  const [fallbackAnswer, setFallbackAnswer] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [captchaError, setCaptchaError] = useState<string>('');
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);


  // Get Turnstile site key from environment
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/contractor-dashboard");
    }
  }, [isAuthenticated]);

  // Check if fallback is available
  React.useEffect(() => {
    if (fallbackStatus?.available && !turnstileSiteKey) {
      setUseFallback(true);
    }
  }, [fallbackStatus?.available, turnstileSiteKey]);

  const handleCaptchaVerify = (token: string) => {
    setTurnstileToken(token);
    setIsCaptchaVerified(true);
  };

  const handleCaptchaError = (error: any) => {
    console.error('Turnstile error:', error);
    if (fallbackStatus?.available) {
      setShowFallback(true);
    }
  };

  const handleFallbackRequest = React.useCallback(async () => {
    try {
      const challenge = await getChallenge();
      setFallbackChallenge({
        id: challenge.challenge_id,
        question: challenge.challenge
      });
      setUseFallback(true);
    } catch (err) {
      console.error('Failed to get fallback challenge:', err);
      // Reset fallback state on error
      setFallbackChallenge(null);
      setUseFallback(false);
    }
  }, [getChallenge]);

  const handleFallbackVerify = React.useCallback(async (answer: string) => {
    if (!fallbackChallenge) {
      setCaptchaError('کپچا در دسترس نیست');
      setCaptchaVerified(false);
      return;
    }
    
    // Set the answer in state
    setFallbackAnswer(answer);
    setCaptchaError(''); // Clear previous errors
    
    try {
      const result = await verifyFallback({ challengeId: fallbackChallenge.id, answer });
      if (result.success || result.valid) {
        // Fallback captcha verified, clear error
        setCaptchaError('');
        setCaptchaVerified(true);
      } else {
        setCaptchaError(result.message || result.error || 'پاسخ کپچا اشتباه است');
        setCaptchaVerified(false);
      }
    } catch (err) {
      console.error('Fallback captcha verification failed:', err);
      setCaptchaError('خطا در تایید کپچا');
      setCaptchaVerified(false);
    }
  }, [fallbackChallenge, verifyFallback]);

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

    if (turnstileToken) {
      await registerWithCaptcha({ ...userData, turnstile_token: turnstileToken });
    } else if (useFallback && fallbackChallenge && fallbackAnswer) {
      // Use fallback captcha
      await register({
        ...userData,
        fallback_captcha_challenge_id: fallbackChallenge.id,
        fallback_captcha_answer: fallbackAnswer
      });
    } else {
      await register(userData);
    }
    // After successful registration, request phone verification
    await requestVerification(phone);
    setShowPhoneVerification(true);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors({});
    setCaptchaError('');
    
    // Validate form fields
    const errors: {[key: string]: string} = {};
    
    if (password !== confirm) {
      errors.confirmPassword = "رمزهای عبور مطابقت ندارند";
    }
    if (!acceptTerms) {
      errors.acceptTerms = "لطفا قوانین و شرایط را بپذیرید";
    }
    if (!selectedScopeId) {
      errors.scope = "لطفا زمینه فعالیت را انتخاب کنید";
    }
    if (selectedServices.length === 0) {
      errors.services = "لطفا حداقل یک سرویس را انتخاب کنید";
    }
    if (!phone.trim()) {
      errors.phone = "شماره همراه الزامی است";
    }
    if (!firstName.trim()) {
      errors.firstName = "نام الزامی است";
    }
    if (!lastName.trim()) {
      errors.lastName = "نام خانوادگی الزامی است";
    }
    if (!email.trim()) {
      errors.email = "ایمیل الزامی است";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "فرمت ایمیل صحیح نیست";
    }
    if (!password.trim()) {
      errors.password = "رمز عبور الزامی است";
    } else if (password.length < 8) {
      errors.password = "رمز عبور باید حداقل 8 کاراکتر باشد";
    }
    
    // Validate captcha
    if (useFallback && fallbackChallenge) {
      if (!fallbackAnswer.trim()) {
        errors.captcha = "لطفا کپچا را حل کنید";
      } else if (captchaError) {
        errors.captcha = captchaError;
      } else if (!captchaVerified) {
        errors.captcha = "لطفا کپچا را تایید کنید";
      }
    } else if (turnstileSiteKey && !turnstileToken) {
      errors.captcha = "لطفا کپچا را تایید کنید";
    }
    
    // If there are validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
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
      navigate("/contractor-dashboard");
    }
  }, [isAuthenticated, showPhoneVerification]);

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
                    className={`text-right ${validationErrors.phone ? 'border-red-500' : ''}`}
                    placeholder="09123456789" 
                    required 
                  />
                  {validationErrors.phone && (
                    <p className="text-xs text-red-500">{validationErrors.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">شماره همراه شما به عنوان نام کاربری استفاده خواهد شد</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">نام *</Label>
                    <Input 
                      id="firstName" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      className={`text-right ${validationErrors.firstName ? 'border-red-500' : ''}`}
                      required 
                    />
                    {validationErrors.firstName && (
                      <p className="text-xs text-red-500">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">نام خانوادگی *</Label>
                    <Input 
                      id="lastName" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      className={`text-right ${validationErrors.lastName ? 'border-red-500' : ''}`}
                      required 
                    />
                    {validationErrors.lastName && (
                      <p className="text-xs text-red-500">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className={`text-right ${validationErrors.email ? 'border-red-500' : ''}`}
                    required 
                  />
                  {validationErrors.email && (
                    <p className="text-xs text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور *</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className={`text-right ${validationErrors.password ? 'border-red-500' : ''}`}
                    required 
                    minLength={8} 
                  />
                  {validationErrors.password && (
                    <p className="text-xs text-red-500">{validationErrors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تکرار رمز عبور *</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirm} 
                    onChange={(e) => setConfirm(e.target.value)} 
                    className={`text-right ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                    required 
                    minLength={8} 
                  />
                  {validationErrors.confirmPassword && (
                    <p className="text-xs text-red-500">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Scope Selection */}
                <div className="space-y-2">
                  <Label htmlFor="scope">زمینه فعالیت *</Label>
                  <Select value={selectedScopeId} onValueChange={setSelectedScopeId}>
                    <SelectTrigger className={validationErrors.scope ? 'border-red-500' : ''}>
                      <SelectValue placeholder="زمینه فعالیت خود را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(scopes) && scopes.map((scope) => (
                        <SelectItem key={scope.id} value={scope.id}>
                          {scope.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.scope && (
                    <p className="text-xs text-red-500">{validationErrors.scope}</p>
                  )}
                </div>

                {/* Services Selection */}
                {selectedScopeId && services && Array.isArray(services) && (
                  <div className="space-y-2">
                    <Label>خدمات قابل ارائه *</Label>
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3 ${validationErrors.services ? 'border-red-500' : ''}`}>
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
                    {validationErrors.services && (
                      <p className="text-xs text-red-500">{validationErrors.services}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      حداقل یک سرویس را انتخاب کنید
                    </p>
                  </div>
                )}

                {/* Turnstile Captcha with Fallback */}
                <TurnstileCaptcha 
                  onVerify={handleCaptchaVerify}
                  timeout={8000} // 8 seconds timeout
                />

                {/* Terms and Conditions */}
                <TermsAndConditions
                  checked={acceptTerms}
                  onCheckedChange={setAcceptTerms}
                  error={validationErrors.acceptTerms}
                />

                {password !== confirm && confirm ? (
                  <Alert variant="destructive">
                    <AlertDescription>رمزهای عبور مطابقت ندارند</AlertDescription>
                  </Alert>
                ) : null}

                {(error || registerCaptchaError) && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {error instanceof Error ? error.message : 
                       registerCaptchaError instanceof Error ? registerCaptchaError.message : 
                       typeof error === 'string' ? error :
                       typeof registerCaptchaError === 'string' ? registerCaptchaError :
                       'ثبت‌نام با خطا مواجه شد'}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  className="w-full" 
                  variant="hero" 
                  type="submit" 
                  disabled={isPending || isVerifying || isCaptchaPending || isVerifyingFallback || !isCaptchaVerified || !acceptTerms}
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
