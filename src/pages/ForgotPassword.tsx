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

  // Default to SMS flow by redirecting immediately
  React.useEffect(() => {
    navigate('/password-reset-sms');
  }, [navigate]);

  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">فراموشی رمز عبور</CardTitle>
            <CardDescription>
              در حال انتقال به صفحه بازیابی با پیامک...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                لطفاً منتظر بمانید...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
