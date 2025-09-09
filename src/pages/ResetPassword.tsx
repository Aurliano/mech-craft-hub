import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthNavbar from "@/components/AuthNavbar";
import { usePasswordResetConfirm } from "@/hooks/useAuth";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutateAsync: confirmReset, isPending, error, isSuccess } = usePasswordResetConfirm();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      navigate("/forgot-password");
    }
  }, [searchParams, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return;
    }
    try {
      await confirmReset({ token, newPassword });
    } catch (err) {
      // Error is handled by the hook
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen" dir="rtl">
        <AuthNavbar />
        <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600">رمز عبور تغییر یافت</CardTitle>
              <CardDescription>
                رمز عبور شما با موفقیت تغییر یافت. اکنون می‌توانید وارد شوید.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="hero" onClick={() => navigate("/login")}>
                ورود به حساب کاربری
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
            <CardTitle className="text-2xl font-bold">بازنشانی رمز عبور</CardTitle>
            <CardDescription>رمز عبور جدید خود را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="newPassword">رمز عبور جدید</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="text-right"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تکرار رمز عبور جدید</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-right"
                  required
                  minLength={8}
                />
              </div>
              {newPassword !== confirmPassword && confirmPassword ? (
                <div className="text-red-600 text-sm">رمزهای عبور مطابقت ندارند</div>
              ) : null}
              {error ? (
                <div className="text-red-600 text-sm">
                  {error.message || "خطا در بازنشانی رمز عبور"}
                </div>
              ) : null}
              <Button className="w-full" variant="hero" type="submit" disabled={isPending}>
                {isPending ? "در حال تغییر..." : "تغییر رمز عبور"}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
