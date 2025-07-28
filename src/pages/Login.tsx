import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AuthNavbar from "@/components/AuthNavbar";

const Login = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <AuthNavbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ورود به حساب کاربری</CardTitle>
          <CardDescription>
            برای ادامه، لطفاً وارد حساب کاربری خود شوید
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              type="email"
              placeholder="ایمیل خود را وارد کنید"
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              type="password"
              placeholder="رمز عبور خود را وارد کنید"
              className="text-right"
            />
          </div>
          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              فراموشی رمز عبور؟
            </Link>
          </div>
          <Button className="w-full" variant="hero">
            ورود
          </Button>
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              حساب کاربری ندارید؟{" "}
              <Link to="/register" className="text-primary hover:underline">
                ثبت نام کنید
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Login;