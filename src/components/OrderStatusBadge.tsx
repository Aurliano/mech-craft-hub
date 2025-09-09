import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const OrderStatusBadge = ({ status, className = "" }: OrderStatusBadgeProps) => {
  const getStatusInfo = (status: string) => {
    const statusMap = {
      'draft': { label: 'پیش‌نویس', variant: 'secondary' as const },
      'submitted': { label: 'ارسال شده', variant: 'default' as const },
      'in_review': { label: 'در حال بررسی', variant: 'secondary' as const },
      'pending': { label: 'در انتظار پیشنهاد', variant: 'secondary' as const },
      'quoted': { label: 'قیمت‌گذاری شده', variant: 'outline' as const },
      'accepted': { label: 'تایید شده', variant: 'default' as const },
      'in_progress': { label: 'در حال انجام', variant: 'secondary' as const },
      'completed': { label: 'تکمیل شده', variant: 'default' as const },
      'delivered': { label: 'تحویل داده شده', variant: 'default' as const },
      'cancelled': { label: 'لغو شده', variant: 'destructive' as const },
      'refunded': { label: 'بازگشت وجه', variant: 'destructive' as const },
      'payment_pending': { label: 'در انتظار پرداخت', variant: 'outline' as const },
      'confirmed': { label: 'تایید نهایی', variant: 'default' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const 
    };
  };

  const statusInfo = getStatusInfo(status);

  return (
    <Badge 
      variant={statusInfo.variant} 
      className={`${className}`}
    >
      {statusInfo.label}
    </Badge>
  );
};

export default OrderStatusBadge;
