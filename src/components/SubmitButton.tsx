import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isLoading: boolean;
  onClick: () => void;
  className?: string;
  text?: string;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const SubmitButton = ({ 
  isLoading, 
  onClick, 
  className,
  text = "ثبت سفارش",
  disabled = false,
  variant = "default",
  size = "default"
}: SubmitButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading || disabled}
      variant={variant}
      size={size}
      className={`w-full sm:w-auto ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          در حال ارسال...
        </>
      ) : (
        text
      )}
    </Button>
  );
};

export default SubmitButton;