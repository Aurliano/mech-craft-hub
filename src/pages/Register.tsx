import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Info, AlertCircle, CheckCircle, User, HardHat, Briefcase, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import { useCustomerRegister, useContractorRegister, useSpecialistRegister, usePhoneVerificationRequest, useScopes, useServices } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";
import TermsAndConditions from "@/components/TermsAndConditions";
import PasswordStrength from "@/components/PasswordStrength";
import ErrorDisplay from "@/components/ErrorDisplay";
import { validatePassword } from "@/lib/passwordValidation";
import { refreshCSRFToken } from "@/lib/csrfProtection";
import { navigateToPhoneVerification } from "@/lib/navigation";

type Role = 'customer' | 'contractor' | 'specialist';
type Step = 1 | 2 | 3 | 4 | 5 | 6;

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Mutations
  const customerRegister = useCustomerRegister();
  const contractorRegister = useContractorRegister();
  const specialistRegister = useSpecialistRegister();

  // Contractor Data
  const { data: scopes } = useScopes();
  const [selectedScopeId, setSelectedScopeId] = useState<string>("");
  const { data: services } = useServices(selectedScopeId || undefined);

  // State
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role>('customer');

  // Form Data
  const [formData, setFormData] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    nationalCode: '', // New
    email: '',
    province: '', // New
    city: '', // New
    address: '', // New
    postalCode: '', // New
    password: '',
    confirmPassword: '',
    selectedServices: [] as string[],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Initialize CSRF
  useEffect(() => {
    refreshCSRFToken().catch(console.error);
  }, []);

  // Reset services when scope changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, selectedServices: [] }));
  }, [selectedScopeId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (currentStep: Step): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      // Role selection - always valid if state is set
    }

    if (currentStep === 2) { // Identity
      if (!formData.firstName.trim()) newErrors.firstName = "نام الزامی است";
      if (!formData.lastName.trim()) newErrors.lastName = "نام خانوادگی الزامی است";
      if (!formData.nationalCode.trim()) newErrors.nationalCode = "کد ملی الزامی است";
      // Simple National Code format check
      if (formData.nationalCode && !/^\d{10}$/.test(formData.nationalCode)) {
        newErrors.nationalCode = "کد ملی باید ۱۰ رقم باشد";
      }
    }

    if (currentStep === 3) { // Contact & Address
      if (!formData.phone.trim()) newErrors.phone = "شماره همراه الزامی است";
      if (!formData.email.trim()) newErrors.email = "ایمیل الزامی است";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "فرمت ایمیل صحیح نیست";

      // Address fields are technically optional in backend usually, but let's require them for "Complete" feel if user wants
      // Making them optional to avoid friction unless requested otherwise.
      // But user asked for "Get Address, Postal Code", so let's make them required for better data.
      // Actually, to avoid drop-off, I'll keep them optional or just warn. Let's make Address required.
      if (!formData.address.trim()) newErrors.address = "آدرس الزامی است";
    }

    if (currentStep === 4) { // Security
      if (!formData.password) newErrors.password = "رمز عبور الزامی است";
      else {
        const validation = validatePassword(formData.password);
        if (!validation.isValid) newErrors.password = validation.errors[0]; // Show first error
      }
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "رمز عبور مطابقت ندارد";
    }

    if (currentStep === 5 && role === 'contractor') { // Professional
      if (!selectedScopeId) newErrors.scope = "زمینه فعالیت الزامی است";
      if (formData.selectedServices.length === 0) newErrors.services = "حداقل یک سرویس انتخاب کنید";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    // Adjust step logic based on role
    if (!validateStep(step)) return;

    let next = step + 1;

    // Skip professional step for non-contractors
    if (step === 4 && role !== 'contractor') {
      next = 6;
    }

    setStep(next as Step);
  };

  const prevStep = () => {
    let prev = step - 1;
    // Skip professional step for non-contractors
    if (step === 6 && role !== 'contractor') {
      prev = 4;
    }
    setStep(prev as Step);
  };

  const handleSubmit = async () => {
    if (!acceptTerms) {
      setErrors(prev => ({ ...prev, terms: "پذیرش قوانین الزامی است" }));
      return;
    }

    const payload: any = {
      username: formData.phone,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      // Add extra fields if backend accepts them, otherwise they are ignored
      national_code: formData.nationalCode,
      address: formData.address,
      postal_code: formData.postalCode,
      province: formData.province,
      city: formData.city,
    };

    try {
      if (role === 'customer') {
        await customerRegister.mutateAsync(payload);
      } else if (role === 'specialist') {
        await specialistRegister.mutateAsync(payload);
      } else if (role === 'contractor') {
        payload.selected_scope = selectedScopeId;
        payload.selected_services = formData.selectedServices;
        await contractorRegister.mutateAsync(payload);
      }

      // Redirect happens in hook onSuccess, but we need to pass phone
      navigateToPhoneVerification(formData.phone, 'register', navigate);

    } catch (error) {
      // Error handled by hook state
      console.error(error);
    }
  };

  // Determine active mutation state
  const isPending = customerRegister.isPending || contractorRegister.isPending || specialistRegister.isPending;
  const error = customerRegister.error || contractorRegister.error || specialistRegister.error;

  return (
    <div className="min-h-screen bg-gray-50/50" dir="rtl">
      <Navbar />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-2xl shadow-lg border-t-4 border-t-primary">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {step === 1 ? 'انتخاب نقش کاربری' : 'تکمیل ثبت نام'}
            </CardTitle>
            <CardDescription>
              {step === 1 ? 'برای شروع، نوع حساب کاربری خود را انتخاب کنید' :
                `شما در حال ثبت نام به عنوان ${role === 'customer' ? 'مشتری' : role === 'contractor' ? 'پیمانکار' : 'متخصص'} هستید`}
            </CardDescription>
          </CardHeader>

          {/* Stepper */}
          {step > 1 && (
            <div className="px-8 py-4">
              <div className="flex items-center justify-between relative mb-8">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300`}
                  style={{ width: `${((step - 1) / (role === 'contractor' ? 5 : 4)) * 100}%` }}></div>

                {[1, 2, 3, 4, ...(role === 'contractor' ? [5] : []), 6].map((s) => (
                  <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2
                                        ${step >= s ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'}
                                    `}>
                    {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>نقش</span>
                <span>هویت</span>
                <span>تماس</span>
                <span>امنیت</span>
                {role === 'contractor' && <span>تخصص</span>}
                <span>تایید</span>
              </div>
            </div>
          )}

          <CardContent className="pt-4">
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RoleCard
                  selected={role === 'customer'}
                  onClick={() => setRole('customer')}
                  icon={<User className="w-10 h-10" />}
                  title="مشتری"
                  desc="برای ثبت سفارش و درخواست خدمات"
                />
                <RoleCard
                  selected={role === 'contractor'}
                  onClick={() => setRole('contractor')}
                  icon={<Briefcase className="w-10 h-10" />}
                  title="پیمانکار"
                  desc="برای مدیریت پروژه‌ها و کارگاه‌ها"
                />
                <RoleCard
                  selected={role === 'specialist'}
                  onClick={() => setRole('specialist')}
                  icon={<HardHat className="w-10 h-10" />}
                  title="متخصص"
                  desc="برای همکاری فنی و اجرایی"
                />
              </div>
            )}

            {/* Step 2: Identity Info */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نام <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <span className="text-xs text-red-500">{errors.firstName}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>نام خانوادگی <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <span className="text-xs text-red-500">{errors.lastName}</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>کد ملی <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    value={formData.nationalCode}
                    onChange={(e) => handleInputChange('nationalCode', e.target.value)}
                    className={errors.nationalCode ? 'border-red-500' : ''}
                    dir="ltr"
                    placeholder="XXXXXXXXXX"
                  />
                  {errors.nationalCode && <span className="text-xs text-red-500">{errors.nationalCode}</span>}
                </div>
              </div>
            )}

            {/* Step 3: Contact & Address */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>شماره همراه <span className="text-red-500">*</span></Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`text-left ${errors.phone ? 'border-red-500' : ''}`}
                      dir="ltr"
                      placeholder="0912..."
                    />
                    {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="w-3 h-3" /> نام کاربری شما خواهد بود
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label>ایمیل <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`text-left ${errors.email ? 'border-red-500' : ''}`}
                      dir="ltr"
                      placeholder="example@mail.com"
                    />
                    {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>استان</Label>
                    <Input
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>شهر</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>آدرس پستی <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      className={`pr-10 ${errors.address ? 'border-red-500' : ''}`}
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="آدرس دقیق پستی..."
                    />
                  </div>
                  {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
                </div>
                <div className="space-y-2">
                  <Label>کد پستی</Label>
                  <Input
                    type="number"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    dir="ltr"
                    placeholder="ده رقمی"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Security */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label>رمز عبور <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`text-left pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3" />
                    <span>حداقل ۸ کاراکتر، شامل حروف و اعداد</span>
                  </div>
                  {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
                  {formData.password && <PasswordStrength password={formData.password} />}
                </div>
                <div className="space-y-2">
                  <Label>تکرار رمز عبور <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`text-left pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword}</span>}
                </div>
              </div>
            )}

            {/* Step 5: Professional Info (Contractor only) */}
            {step === 5 && role === 'contractor' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label>زمینه فعالیت <span className="text-red-500">*</span></Label>
                  <Select value={selectedScopeId} onValueChange={setSelectedScopeId}>
                    <SelectTrigger className={errors.scope ? 'border-red-500' : ''}>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {scopes?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.scope && <span className="text-xs text-red-500">{errors.scope}</span>}
                </div>

                {selectedScopeId && services && (
                  <div className="space-y-2">
                    <Label>خدمات قابل ارائه <span className="text-red-500">*</span></Label>
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3 ${errors.services ? 'border-red-500' : ''}`}>
                      {services.map((service) => (
                        <div key={service.id} className="flex items-center gap-2">
                          <Checkbox
                            id={service.id}
                            checked={formData.selectedServices.includes(service.id)}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({
                                ...prev,
                                selectedServices: checked
                                  ? [...prev.selectedServices, service.id]
                                  : prev.selectedServices.filter(id => id !== service.id)
                              }));
                            }}
                          />
                          <Label htmlFor={service.id} className="text-sm cursor-pointer">{service.name}</Label>
                        </div>
                      ))}
                    </div>
                    {errors.services && <span className="text-xs text-red-500">{errors.services}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Review & Submit */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <Alert className="bg-blue-50/50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    لطفاً اطلاعات زیر را بررسی و تایید کنید. پس از ثبت نام، کد تایید به شماره {formData.phone} ارسال خواهد شد.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-muted-foreground">نقش کاربری:</div>
                  <div className="font-medium text-left">{role === 'customer' ? 'مشتری' : role === 'contractor' ? 'پیمانکار' : 'متخصص'}</div>

                  <div className="text-muted-foreground">نام کامل:</div>
                  <div className="font-medium text-left">{formData.firstName} {formData.lastName}</div>

                  <div className="text-muted-foreground">شماره همراه:</div>
                  <div className="font-medium text-left" dir="ltr">{formData.phone}</div>

                  {role === 'contractor' && (
                    <>
                      <div className="text-muted-foreground">زمینه فعالیت:</div>
                      <div className="font-medium text-left">
                        {scopes?.find(s => s.id === selectedScopeId)?.name || 'نامشخص'}
                      </div>
                    </>
                  )}
                </div>

                <TermsAndConditions
                  checked={acceptTerms}
                  onCheckedChange={setAcceptTerms}
                  error={errors.terms}
                />

                <ErrorDisplay error={error} showDismiss={true} />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t p-4 bg-gray-50/50">
            {step === 1 ? (
              <div className="w-full text-center">
                <span className="text-sm text-muted-foreground">
                  قبلاً ثبت‌نام کرده‌اید؟{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    وارد شوید
                  </Link>
                </span>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={prevStep}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                مرحله قبل
              </Button>
            )}

            {step === 1 ? (
              <Button onClick={nextStep} className="hidden">شروع</Button>
            ) : step === 6 ? (
              <Button
                variant="hero"
                onClick={handleSubmit}
                disabled={isPending || !acceptTerms}
                className="gap-2 px-8"
              >
                {isPending ? "در حال ثبت نام..." : "تکمیل ثبت نام"}
                <CheckCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                مرحله بعد
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const RoleCard = ({ selected, onClick, icon, title, desc }: { selected: boolean, onClick: () => void, icon: React.ReactNode, title: string, desc: string }) => (
  <div
    onClick={onClick}
    className={`
            cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-200 hover:shadow-md
            ${selected ? 'border-primary bg-primary/5 shadow-md scale-105' : 'border-gray-200 bg-white hover:border-gray-300'}
        `}
  >
    <div className={`mx-auto mb-3 w-16 h-16 rounded-full flex items-center justify-center transition-colors
            ${selected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}
        `}>
      {icon}
    </div>
    <h3 className={`font-bold text-lg mb-1 ${selected ? 'text-primary' : 'text-gray-700'}`}>{title}</h3>
    <p className="text-xs text-muted-foreground">{desc}</p>

    <div className={`mt-4 w-6 h-6 rounded-full border mx-auto flex items-center justify-center
            ${selected ? 'border-primary bg-primary text-white' : 'border-gray-300'}
        `}>
      {selected && <CheckCircle className="w-4 h-4" />}
    </div>
  </div>
);

export default Register;