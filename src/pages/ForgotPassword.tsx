import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import { usePasswordResetRequest } from "@/hooks/useAuth";

const ForgotPassword = () => {
  const { mutateAsync: requestReset, isPending, error, isSuccess } = usePasswordResetRequest();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await requestReset(email);
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleSMSReset = () => {
    navigate('/password-reset-sms');
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">فراموشی رمز عبور</CardTitle>
            <CardDescription>
              ایمیل خود را وارد کنید تا لینک بازنشانی رمز عبور برایتان ارسال شود
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <Alert>
                <AlertDescription>
                  لینک بازنشانی رمز عبور به ایمیل شما ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.
                </AlertDescription>
              </Alert>
            ) : (
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-right"
                    required
                  />
                </div>
                {error ? (
                  <div className="text-red-600 text-sm">
                    {error.message || "خطا در ارسال درخواست"}
                  </div>
                ) : null}
                <Button className="w-full" variant="hero" type="submit" disabled={isPending}>
                  {isPending ? "در حال ارسال..." : "ارسال لینک بازنشانی"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">یا</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleSMSReset}
                >
                  بازیابی با پیامک
                </Button>
                
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    رمز عبور خود را به یاد آوردید؟{" "}
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

export default ForgotPassword;
