import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AuthNavbar from "@/components/AuthNavbar";

const Register = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <AuthNavbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ثبت نام</CardTitle>
          <CardDescription>
            حساب کاربری جدید ایجاد کنید
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">نام</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="نام خود را وارد کنید"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">نام خانوادگی</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="نام خانوادگی خود را وارد کنید"
                className="text-right"
              />
            </div>
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="رمز عبور خود را مجدداً وارد کنید"
              className="text-right"
            />
          </div>
          <Button className="w-full" variant="hero">
            ثبت نام
          </Button>
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              قبلاً حساب کاربری دارید؟{" "}
              <Link to="/login" className="text-primary hover:underline">
                وارد شوید
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Register;