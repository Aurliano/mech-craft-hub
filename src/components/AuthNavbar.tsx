import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";

const AuthNavbar = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Wrench className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-foreground">مهندسی سازه</span>
          </Link>

          {/* Home Button */}
          <Link to="/">
            <Button variant="outline" size="sm">
              خانه
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar;