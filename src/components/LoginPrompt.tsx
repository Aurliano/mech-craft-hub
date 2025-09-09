import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface LoginPromptProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ 
  title = "برای ثبت سفارش وارد شوید",
  description = "برای دسترسی به این بخش، لطفاً وارد حساب کاربری خود شوید.",
  icon
}) => {
  return (
    <div className="text-center py-12">
      <div className="p-6 bg-muted/30 rounded-lg max-w-md mx-auto">
        {icon || <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button className="w-full sm:w-auto">ورود</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" className="w-full sm:w-auto">ثبت نام</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
