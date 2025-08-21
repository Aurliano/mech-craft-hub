import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AuthNavbar from "@/components/AuthNavbar";
import { useRegister } from "@/hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { mutateAsync: register, isPending, error } = useRegister();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return;
    await register({ username, email, phone, password });
    navigate("/login");
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <AuthNavbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">ثبت نام</CardTitle>
            <CardDescription>حساب کاربری جدید ایجاد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">نام کاربری</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="text-right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">تلفن</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="text-right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="text-right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
                <Input id="confirmPassword" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="text-right" />
              </div>
              {error ? <div className="text-red-600 text-sm">ثبت‌نام با خطا مواجه شد</div> : null}
              <Button className="w-full" variant="hero" type="submit" disabled={isPending}>
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
    </div>
  );
};

export default Register;