import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Info, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSpecialistRegister } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";
import TermsAndConditions from "@/components/TermsAndConditions";
import PasswordStrength from "@/components/PasswordStrength";
import ErrorDisplay from "@/components/ErrorDisplay";
import { validatePassword } from "@/lib/passwordValidation";
import { refreshCSRFToken } from "@/lib/csrfProtection";
import { navigateToPhoneVerification } from "@/lib/navigation";

const SpecialistRegister = () => {
  const navigate = useNavigate();
  const { mutateAsync: register, isPending, error } = useSpecialistRegister();
  const { isAuthenticated } = useAuth();
  
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/specialist-dashboard");
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

  const performRegistration = async () => {
    const userData = {
      username: phone, // Use phone as username
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password,
    };

    await register(userData);
    
    // After successful registration, redirect to phone verification
    navigateToPhoneVerification(phone, 'register', navigate);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Enhanced validation
    if (!firstName.trim()) {
      alert("لطفاً نام خود را وارد کنید");
      return;
    }
    
    if (!lastName.trim()) {
      alert("لطفاً نام خانوادگی خود را وارد کنید");
      return;
    }
    
    if (!phone.trim()) {
      alert("لطفاً شماره همراه خود را وارد کنید");
      return;
    }
    
    if (!email.trim()) {
      alert("لطفاً ایمیل خود را وارد کنید");
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      alert(`رمز عبور ضعیف است:\n${passwordValidation.errors.join('\n')}`);
      return;
    }
    
    if (password !== confirm) {
      alert("رمزهای عبور مطابقت ندارند");
      return;
    }
    
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50" dir="rtl">
      <Navbar />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">ثبت نام نیروی متخصص</CardTitle>
            <CardDescription>حساب کاربری جدید برای نیروی متخصص ایجاد کنید</CardDescription>
          </CardHeader>
          <CardContent>
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>شماره همراه شما به عنوان نام کاربری استفاده خواهد شد</span>
                </div>
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
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="text-right pr-10" 
                    placeholder="رمز عبور خود را وارد کنید"
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>لطفاً کیبورد خود را روی حالت انگلیسی قرار دهید</span>
                </div>
                {password && <PasswordStrength password={password} />}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تکرار رمز عبور *</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirm} 
                    onChange={(e) => setConfirm(e.target.value)} 
                    className="text-right pr-10" 
                    placeholder="رمز عبور را دوباره وارد کنید"
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

              <ErrorDisplay 
                error={error} 
                onRetry={() => window.location.reload()}
              />
              
              {/* Custom error messages */}
              {error && (
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
                disabled={isPending || !acceptTerms}
              >
                {isPending ? "در حال ثبت‌نام..." : "ثبت نام"}
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
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default SpecialistRegister;

