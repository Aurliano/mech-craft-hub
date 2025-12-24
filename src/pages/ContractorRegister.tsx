import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Info, AlertCircle, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import { useContractorRegister, usePhoneVerificationRequest, useRegisterWithCaptcha } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";
import TurnstileCaptcha from "@/components/TurnstileCaptcha";
import TermsAndConditions from "@/components/TermsAndConditions";
import PasswordStrength from "@/components/PasswordStrength";
import ErrorDisplay from "@/components/ErrorDisplay";
import { validatePassword } from "@/lib/passwordValidation";
import { useScopes, useServices } from "@/hooks/useAuth";
import { refreshCSRFToken } from "@/lib/csrfProtection";
import { navigateToPhoneVerification } from "@/lib/navigation";

const ContractorRegister = () => {
  const navigate = useNavigate();
  const { mutateAsync: register, isPending, error } = useContractorRegister();
  const { mutateAsync: requestVerification, isPending: isVerifying } = usePhoneVerificationRequest();
  const { mutateAsync: registerWithCaptcha, isPending: isCaptchaPending, error: registerCaptchaError } = useRegisterWithCaptcha();
  const { isAuthenticated } = useAuth();

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});


  // Get Turnstile site key from environment
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/contractor-dashboard");
    }
  }, [isAuthenticated, navigate]);

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
    setTurnstileToken(token);
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
      selected_scope: selectedScopeId || null,
      selected_services: selectedServices
    };

    // Since Turnstile is disabled, always use regular registration
    await register(userData);

    // After successful registration, redirect to phone verification with proper navigation
    navigateToPhoneVerification(phone, 'register', navigate);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate form fields
    const errors: { [key: string]: string } = {};

    if (password !== confirm) {
      if (password.trim() === confirm.trim()) {
        errors.confirmPassword = "رمزها یکسان هستند اما فاصله اضافی دارند (لطفا دقت کنید)";
      } else {
        errors.confirmPassword = "رمزهای عبور مطابقت ندارند";
      }
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
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors.join('، ');
      }
    }

    // Validate captcha
    if (turnstileSiteKey && !turnstileToken) {
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
  }, [isAuthenticated, showPhoneVerification, navigate]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden" dir="rtl">
      <Navbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)] overflow-x-hidden w-full">
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
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`text-right pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                      required
                      minLength={8}
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
                  {password && <PasswordStrength password={password} />}
                  {validationErrors.password && (
                    <p className="text-xs text-red-500">{validationErrors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تکرار رمز عبور *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={`text-right pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
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
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
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
                    <SelectContent position="item-aligned" className="max-h-[300px] overflow-y-auto">
                      {Array.isArray(scopes) && scopes.map((scope) => (
                        <SelectItem key={scope.id} value={scope.id}>
                          {scope.name}
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

                <div className="mt-2 text-xs text-muted-foreground">
                  نیاز به راهنمای گام‌به‌گام ثبت‌نام و ثبت کارگاه دارید؟{" "}
                  <a
                    href="https://saydatech.ir/blog/sabt-nam-kargah"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    آموزش ویدیویی ثبت‌نام پیمانکاران و کارگاه‌ها را ببینید
                  </a>
                </div>

                {/* Turnstile Captcha - Temporarily disabled */}
                {/* <TurnstileCaptcha 
                  onVerify={handleCaptchaVerify}
                  timeout={8000} // 8 seconds timeout
                /> */}

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
                  error={validationErrors.acceptTerms}
                />

                {password !== confirm && confirm ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {password.trim() === confirm.trim()
                        ? "رمزها یکسان هستند اما فاصله اضافی دارند (لطفا دقت کنید)"
                        : "رمزهای عبور مطابقت ندارند"}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <ErrorDisplay
                  error={error || registerCaptchaError}
                  onRetry={() => window.location.reload()}
                />

                {/* Custom error messages */}
                {(error || registerCaptchaError) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error?.message?.includes('username already exists') ||
                        error?.message?.includes('نام کاربری قبلاً استفاده شده') ?
                        'این شماره همراه قبلاً ثبت شده است. لطفاً وارد شوید یا از شماره دیگری استفاده کنید.' :
                        error?.message?.includes('email already exists') ||
                          error?.message?.includes('ایمیل قبلاً استفاده شده') ?
                          'این ایمیل قبلاً ثبت شده است. لطفاً از ایمیل دیگری استفاده کنید.' :
                          error?.message || 'خطایی رخ داده است. لطفاً دوباره تلاش کنید.'}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  className="w-full"
                  variant="hero"
                  type="submit"
                  disabled={isPending || isVerifying || isCaptchaPending || !acceptTerms}
                >
                  {isPending || isVerifying || isCaptchaPending ? "در حال ثبت‌نام..." : "ثبت نام پیمانکار"}
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
