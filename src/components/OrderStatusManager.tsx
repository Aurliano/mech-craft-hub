import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, CheckCircle, Clock, AlertCircle, Truck, 
  MessageCircle, Eye, Download, Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/api';
import { formatPriceNumber } from '@/lib/priceUtils';

interface OrderItem {
  id: string;
  service: {
    name: string;
  };
  status: string;
  price?: number;
  estimated_delivery?: string;
  actual_delivery?: string;
  assigned_contractor?: {
    username: string;
  };
  order: {
    order_number: string;
    customer: {
      username: string;
    };
  };
}

interface OrderStatusManagerProps {
  orderItem: OrderItem;
  userRole: 'customer' | 'contractor';
  onStatusUpdate?: (itemId: string, newStatus: string) => void;
}

const OrderStatusManager: React.FC<OrderStatusManagerProps> = ({
  orderItem,
  userRole,
  onStatusUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'pending': { 
        label: 'در انتظار', 
        variant: 'secondary' as const, 
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      },
      'quoted': { 
        label: 'قیمت‌گذاری شده', 
        variant: 'default' as const, 
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      'accepted': { 
        label: 'تایید شده', 
        variant: 'secondary' as const, 
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      'in_progress': { 
        label: 'در حال انجام', 
        variant: 'default' as const, 
        icon: Package,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      },
      'delivered': { 
        label: 'تحویل داده شده', 
        variant: 'default' as const, 
        icon: Truck,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      'completed': { 
        label: 'تکمیل شده', 
        variant: 'default' as const, 
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      'cancelled': { 
        label: 'لغو شده', 
        variant: 'destructive' as const, 
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      },
    };
    
    return statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: AlertCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    };
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(getApiUrl(`/api/v1/order-items/${orderItem.id}/status/`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('خطا در به‌روزرسانی وضعیت');
      }

      onStatusUpdate?.(orderItem.id, newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای نامشخص');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliverProject = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(getApiUrl(`/api/v1/order-items/${orderItem.id}/deliver/`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('خطا در تحویل پروژه');
      }

      onStatusUpdate?.(orderItem.id, 'delivered');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای نامشخص');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCompletion = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(getApiUrl(`/api/v1/order-items/${orderItem.id}/confirm/`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('خطا در تایید تکمیل پروژه');
      }

      onStatusUpdate?.(orderItem.id, 'completed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای نامشخص');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionButtons = () => {
    const statusInfo = getStatusInfo(orderItem.status);
    const IconComponent = statusInfo.icon;

    if (userRole === 'contractor') {
      switch (orderItem.status) {
        case 'accepted':
          return (
            <Button
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Package className="h-4 w-4 ml-2" />
              شروع پروژه
            </Button>
          );
        case 'in_progress':
          return (
            <Button
              onClick={handleDeliverProject}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Truck className="h-4 w-4 ml-2" />
              تحویل پروژه
            </Button>
          );
        default:
          return null;
      }
    } else {
      switch (orderItem.status) {
        case 'delivered':
          return (
            <div className="flex gap-2">
              <Button
                onClick={handleConfirmCompletion}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 ml-2" />
                تایید تکمیل
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 ml-2" />
                مشاهده جزئیات
              </Button>
            </div>
          );
        case 'completed':
          return (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 ml-2" />
                امتیازدهی
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-2" />
                دانلود فایل‌ها
              </Button>
            </div>
          );
        default:
          return (
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 ml-2" />
              مشاهده جزئیات
            </Button>
          );
      }
    }
  };

  const statusInfo = getStatusInfo(orderItem.status);
  const IconComponent = statusInfo.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
              <IconComponent className={`h-5 w-5 ${statusInfo.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{orderItem.service.name}</CardTitle>
              <p className="text-sm text-gray-600">
                سفارش: {orderItem.order.order_number}
              </p>
            </div>
          </div>
          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
            <IconComponent className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>
            <span className="font-medium">مبلغ:</span>
            <p className="text-green-600 font-semibold">
              {orderItem.price ? `${formatPriceNumber(orderItem.price)} تومان` : 'در انتظار قیمت‌گذاری'}
            </p>
          </div>
          
          {orderItem.assigned_contractor && (
            <div>
              <span className="font-medium">پیمانکار:</span>
              <p>{orderItem.assigned_contractor.username}</p>
            </div>
          )}
          
          {orderItem.estimated_delivery && (
            <div>
              <span className="font-medium">تاریخ تحویل پیش‌بینی شده:</span>
              <p>{new Date(orderItem.estimated_delivery).toLocaleDateString('fa-IR')}</p>
            </div>
          )}
          
          {orderItem.actual_delivery && (
            <div>
              <span className="font-medium">تاریخ تحویل واقعی:</span>
              <p>{new Date(orderItem.actual_delivery).toLocaleDateString('fa-IR')}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {getActionButtons()}
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 ml-2" />
              پشتیبانی
            </Button>
          </div>
          
          {orderItem.status === 'in_progress' && (
            <div className="text-sm text-orange-600">
              <Clock className="h-4 w-4 inline ml-1" />
              در حال انجام...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusManager;
