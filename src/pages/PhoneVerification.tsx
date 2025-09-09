import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthNavbar from "@/components/AuthNavbar";
import { usePhoneVerificationRequest, usePhoneVerificationConfirm } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";

const PhoneVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync: requestCode, isPending: isRequesting, error: requestError } = usePhoneVerificationRequest();
  const { mutateAsync: confirmCode, isPending: isConfirming, error: confirmError, isSuccess } = usePhoneVerificationConfirm();
  const { isAuthenticated } = useAuth();
  
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [step, setStep] = useState<'request' | 'confirm'>('request');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (location.state?.phone) {
      setPhone(location.state.phone);
      setStep('confirm');
    }
  }, [location.state]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await requestCode(phone);
      setTimeLeft(result.expires_in || 120);
      setStep('confirm');
    } catch (err) {
      // Error is handled by the hook
    }
  }

  async function handleConfirmCode(e: React.FormEvent) {
    e.preventDefault();
    try {
      await confirmCode({ phone, code });
      // After successful verification, redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Error is handled by the hook
    }
  }

  function handleResendCode() {
    setTimeLeft(120);
    requestCode(phone);
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen" dir="rtl">
        <AuthNavbar />
        <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600">شماره تلفن تأیید شد</CardTitle>
              <CardDescription>
                شماره تلفن شما با موفقیت تأیید شد.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="hero" onClick={() => navigate("/dashboard")}>
                ادامه
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <AuthNavbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">تأیید شماره تلفن</CardTitle>
            <CardDescription>
              {step === 'request' 
                ? 'شماره تلفن خود را وارد کنید تا کد تأیید برایتان ارسال شود'
                : 'کد تأیید ارسال شده را وارد کنید'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'request' ? (
              <form className="space-y-4" onSubmit={handleRequestCode}>
                <div className="space-y-2">
                  <Label htmlFor="phone">شماره تلفن</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-right"
                    placeholder="09123456789"
                    required
                  />
                </div>
                {requestError ? (
                  <div className="text-red-600 text-sm">
                    {requestError.message || "خطا در ارسال کد تأیید"}
                  </div>
                ) : null}
                <Button className="w-full" variant="hero" type="submit" disabled={isRequesting}>
                  {isRequesting ? "در حال ارسال..." : "ارسال کد تأیید"}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleConfirmCode}>
                <div className="space-y-2">
                  <Label htmlFor="code">کد تأیید</Label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="text-center text-2xl tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    کد تأیید به شماره {phone} ارسال شد
                  </div>
                </div>
                {timeLeft > 0 ? (
                  <div className="text-center text-sm text-muted-foreground">
                    ارسال مجدد کد در {timeLeft} ثانیه
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResendCode}
                    disabled={isRequesting}
                  >
                    ارسال مجدد کد
                  </Button>
                )}
                {confirmError ? (
                  <div className="text-red-600 text-sm">
                    {confirmError.message || "کد تأیید نامعتبر است"}
                  </div>
                ) : null}
                <Button className="w-full" variant="hero" type="submit" disabled={isConfirming || code.length !== 6}>
                  {isConfirming ? "در حال تأیید..." : "تأیید کد"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhoneVerification;
