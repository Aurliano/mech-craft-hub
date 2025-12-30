import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Info, AlertCircle, CheckCircle, User, HardHat, Briefcase, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCustomerRegister, useContractorRegister, useSpecialistRegister, useScopes, useServices } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";
import TermsAndConditions from "@/components/TermsAndConditions";
import PasswordStrength from "@/components/PasswordStrength";
import ErrorDisplay from "@/components/ErrorDisplay";
import { validatePassword } from "@/lib/passwordValidation";
import { refreshCSRFToken } from "@/lib/csrfProtection";
import { navigateToPhoneVerification } from "@/lib/navigation";
import logo from "@/assets/logo.png";

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
        nationalCode: '',
        email: '',
        province: '',
        city: '',
        address: '',
        postalCode: '',
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
            // Role selection - now explicitly handled by nextStep trigger usually, but validation is trivial
        }

        if (currentStep === 2) { // Identity
            if (!formData.firstName.trim()) newErrors.firstName = "نام الزامی است";
            if (!formData.lastName.trim()) newErrors.lastName = "نام خانوادگی الزامی است";
            if (!formData.nationalCode.trim()) newErrors.nationalCode = "کد ملی الزامی است";
            if (formData.nationalCode && !/^\d{10}$/.test(formData.nationalCode)) {
                newErrors.nationalCode = "کد ملی باید ۱۰ رقم باشد";
            }
        }

        if (currentStep === 3) { // Contact & Address
            if (!formData.phone.trim()) newErrors.phone = "شماره همراه الزامی است";
            if (!formData.email.trim()) newErrors.email = "ایمیل الزامی است";
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "فرمت ایمیل صحیح نیست";
            if (!formData.address.trim()) newErrors.address = "آدرس الزامی است";
        }

        if (currentStep === 4) { // Security
            if (!formData.password) newErrors.password = "رمز عبور الزامی است";
            else {
                const validation = validatePassword(formData.password);
                if (!validation.isValid) newErrors.password = validation.errors[0];
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

            navigateToPhoneVerification(formData.phone, 'register', navigate);

        } catch (error) {
            console.error(error);
        }
    };

    const isPending = customerRegister.isPending || contractorRegister.isPending || specialistRegister.isPending;
    const error = customerRegister.error || contractorRegister.error || specialistRegister.error;

    return (
        <div className="flex h-screen bg-white overflow-hidden" dir="rtl">
            {/* Right Side: Visual/Branding (Hidden on mobile, 40% width on desktop) */}
            <div className="hidden lg:flex w-[40%] bg-slate-900 relative items-center justify-center p-12 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900/50 z-10" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0" />

                <div className="relative z-20 max-w-md space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                            <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
                            سامانه هوشمند
                        </div>
                        <h1 className="text-4xl font-bold leading-tight tracking-tight">
                            به <span className="text-blue-400">پلتفرم مهندسی سایدا</span> خوش آمدید
                        </h1>
                        <p className="text-lg text-slate-300/90 leading-relaxed">
                            پلتفرم تخصصی برای تعامل مشتریان، پیمانکاران و متخصصین صنایع.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-8">
                        <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                            <Briefcase className="w-8 h-8 text-blue-400 mb-3" />
                            <h3 className="font-semibold text-lg">پیمانکاران</h3>
                            <p className="text-sm text-slate-400 mt-1">مدیریت پروژه و سفارشات</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                            <HardHat className="w-8 h-8 text-blue-400 mb-3" />
                            <h3 className="font-semibold text-lg">متخصصین</h3>
                            <p className="text-sm text-slate-400 mt-1">فرصت‌های شغلی و همکاری</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Left Side: Form (100% on mobile, 60% on desktop) */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto">
                <div className="p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
                        <img src={logo} alt="لوگو" className="h-8 w-auto flex-shrink-0" />
                        <span className="hidden sm:inline">پلتفرم مهندسی سایدا</span>
                    </Link>
                    <div className="text-sm text-muted-foreground">
                        حساب کاربری دارید؟ <Link to="/login" className="text-blue-600 font-semibold hover:underline">وارد شوید</Link>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center px-4 sm:px-12 lg:px-24">
                    <div className="w-full max-w-lg space-y-8">

                        <div className="space-y-2 text-center sm:text-right">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                                {step === 1 ? 'انتخاب نقش کاربری' : 'تکمیل ثبت نام'}
                            </h2>
                            <p className="text-slate-500">
                                {step === 1 ? 'برای شروع، نوع حساب کاربری خود را انتخاب کنید' :
                                    `مرحله ${step} از ${role === 'contractor' ? 5 : 4} - ${role === 'customer' ? 'مشتری' : role === 'contractor' ? 'پیمانکار' : 'متخصص'}`}
                            </p>
                        </div>

                        {/* Progress Bar */}
                        {step > 1 && (
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full transition-all duration-500 ease-in-out"
                                    style={{ width: `${((step - 1) / (role === 'contractor' ? 5 : 4)) * 100}%` }}
                                />
                            </div>
                        )}

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Step 1: Role Selection */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="grid gap-4">
                                        <RoleOption
                                            id="customer"
                                            selected={role === 'customer'}
                                            onClick={() => setRole('customer')}
                                            icon={<User />}
                                            title="مشتری"
                                            desc="برای ثبت سفارش و درخواست خدمات"
                                        />
                                        <RoleOption
                                            id="contractor"
                                            selected={role === 'contractor'}
                                            onClick={() => setRole('contractor')}
                                            icon={<Briefcase />}
                                            title="پیمانکار"
                                            desc="برای مدیریت پروژه‌ها و کارگاه‌ها"
                                        />
                                        <RoleOption
                                            id="specialist"
                                            selected={role === 'specialist'}
                                            onClick={() => setRole('specialist')}
                                            icon={<HardHat />}
                                            title="متخصص"
                                            desc="برای همکاری فنی و اجرایی"
                                        />
                                    </div>
                                    <Button onClick={nextStep} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                                        ادامه
                                        <ArrowLeft className="mr-2 h-5 w-5" />
                                    </Button>
                                </div>
                            )}

                            {/* Step 2: Identity Info */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>نام</Label>
                                            <Input
                                                value={formData.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                className={`h-11 ${errors.firstName ? 'border-red-500' : ''}`}
                                            />
                                            {errors.firstName && <span className="text-xs text-red-500">{errors.firstName}</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>نام خانوادگی</Label>
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                className={`h-11 ${errors.lastName ? 'border-red-500' : ''}`}
                                            />
                                            {errors.lastName && <span className="text-xs text-red-500">{errors.lastName}</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>کد ملی</Label>
                                        <Input
                                            type="number"
                                            value={formData.nationalCode}
                                            onChange={(e) => handleInputChange('nationalCode', e.target.value)}
                                            className={`h-11 ${errors.nationalCode ? 'border-red-500' : ''}`}
                                            dir="ltr"
                                            placeholder="XXXXXXXXXX"
                                        />
                                        {errors.nationalCode && <span className="text-xs text-red-500">{errors.nationalCode}</span>}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Contact Info */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>شماره همراه</Label>
                                        <Input

                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className={`h-11 text-left ${errors.phone ? 'border-red-500' : ''}`}
                                            dir="ltr"
                                            placeholder="0912..."
                                        />
                                        {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ایمیل</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className={`h-11 text-left ${errors.email ? 'border-red-500' : ''}`}
                                            dir="ltr"
                                            placeholder="example@mail.com"
                                        />
                                        {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>استان</Label>
                                            <Input
                                                className="h-11"
                                                value={formData.province}
                                                onChange={(e) => handleInputChange('province', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>شهر</Label>
                                            <Input
                                                className="h-11"
                                                value={formData.city}
                                                onChange={(e) => handleInputChange('city', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>آدرس دقیق</Label>
                                        <div className="relative">
                                            <MapPin className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                className={`h-11 pr-10 ${errors.address ? 'border-red-500' : ''}`}
                                                value={formData.address}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                            />
                                        </div>
                                        {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>کد پستی</Label>
                                        <Input
                                            type="number"
                                            className="h-11"
                                            value={formData.postalCode}
                                            onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Security */}
                            {step === 4 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>رمز عبور</Label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                className={`h-11 text-left pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
                                        {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
                                        {formData.password && <PasswordStrength password={formData.password} />}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>تکرار رمز عبور</Label>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                className={`h-11 text-left pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
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

                            {/* Step 5: Professional Info */}
                            {step === 5 && role === 'contractor' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>زمینه فعالیت</Label>
                                        <Select value={selectedScopeId} onValueChange={setSelectedScopeId}>
                                            <SelectTrigger className={`h-11 ${errors.scope ? 'border-red-500' : ''}`}>
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
                                            <Label>خدمات قابل ارائه</Label>
                                            <div className={`grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-md p-3 ${errors.services ? 'border-red-500' : ''}`}>
                                                {services.map((service) => (
                                                    <div key={service.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
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
                                                        <Label htmlFor={service.id} className="text-sm cursor-pointer flex-1">{service.name}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.services && <span className="text-xs text-red-500">{errors.services}</span>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 6: Review */}
                            {step === 6 && (
                                <div className="space-y-6">
                                    <Alert className="bg-blue-50/50 border-blue-200">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">
                                            کد تایید به {formData.phone} ارسال می‌شود.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="rounded-lg border bg-slate-50 p-4 space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">نقش:</span>
                                            <span className="font-medium">{role === 'customer' ? 'مشتری' : role === 'contractor' ? 'پیمانکار' : 'متخصص'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">نام کامل:</span>
                                            <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">شماره:</span>
                                            <span className="font-medium" dir="ltr">{formData.phone}</span>
                                        </div>
                                    </div>

                                    <TermsAndConditions
                                        checked={acceptTerms}
                                        onCheckedChange={setAcceptTerms}
                                        error={errors.terms}
                                    />

                                    <ErrorDisplay error={error} showDismiss={true} />
                                </div>
                            )}

                        </div>

                        {/* Navigation Footer */}
                        {step > 1 && (
                            <div className="flex items-center gap-4 pt-8">
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    className="h-12 px-6"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </Button>

                                {step === 6 ? (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isPending || !acceptTerms}
                                        className="h-12 flex-1 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                    >
                                        {isPending ? "در حال پردازش..." : "تکمیل ثبت نام"}
                                        <CheckCircle className="mr-2 w-5 h-5" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={nextStep}
                                        className="h-12 flex-1 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                    >
                                        مرحله بعد
                                        <ArrowLeft className="mr-2 w-5 h-5" />
                                    </Button>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

// UI Components
const RoleOption = ({ id, selected, onClick, icon, title, desc }: any) => (
    <div
        onClick={onClick}
        className={`
            relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2
            ${selected
                ? 'border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600/20'
                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }
        `}
    >
        <div className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-colors
            ${selected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white text-slate-500 border border-slate-200'}
        `}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <div className="flex-1">
            <h3 className={`font-bold text-lg ${selected ? 'text-blue-700' : 'text-slate-700'}`}>{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
        </div>
        {selected && <CheckCircle className="text-blue-600 w-6 h-6 animate-in zoom-in duration-300" />}
    </div>
);

export default Register;