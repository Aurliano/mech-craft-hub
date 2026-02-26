import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, FileText, CheckCircle, X } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { formatPriceNumber } from '@/lib/priceUtils';

interface QuoteCardProps {
  quote: {
    id: string;
    contractor: {
      username: string;
      display_name?: string;
    };
    price: number;
    documentation_price?: number;
    delivery_days: number;
    documentation_days?: number;
    notes?: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    expires_at?: string;
  };
  onAccept?: (quoteId: string) => void;
  onReject?: (quoteId: string) => void;
  showActions?: boolean;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

const QuoteCard = ({ 
  quote, 
  onAccept, 
  onReject, 
  showActions = true,
  isAccepting = false,
  isRejecting = false
}: QuoteCardProps) => {
  const totalPrice = quote.price + (quote.documentation_price || 0);
  const totalDays = quote.delivery_days + (quote.documentation_days || 0);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">پیشنهاد از {quote.contractor.display_name || quote.contractor.username}</CardTitle>
          <OrderStatusBadge status={quote.status} />
        </div>
        <CardDescription>
          {new Date(quote.created_at).toLocaleDateString('fa-IR')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">قیمت اصلی</p>
              <p className="font-semibold">{formatPriceNumber(quote.price)} تومان</p>
            </div>
          </div>
          {quote.documentation_price && quote.documentation_price > 0 && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">مستندسازی</p>
                <p className="font-semibold">{formatPriceNumber(quote.documentation_price)} تومان</p>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">زمان تحویل</p>
              <p className="font-semibold">{quote.delivery_days} روز</p>
            </div>
          </div>
          {quote.documentation_days && quote.documentation_days > 0 && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">زمان مستندسازی</p>
                <p className="font-semibold">{quote.documentation_days} روز</p>
              </div>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">مجموع:</span>
            <span className="text-xl font-bold text-green-600">
              {formatPriceNumber(totalPrice)} تومان
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>زمان کل:</span>
            <span>{totalDays} روز</span>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-1">یادداشت:</p>
            <p className="text-sm text-gray-700">{quote.notes}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && quote.status === 'pending' && (
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={() => onAccept?.(quote.id)}
              disabled={isAccepting || isRejecting}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 ml-2" />
              {isAccepting ? 'در حال تایید...' : 'تایید پیشنهاد'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => onReject?.(quote.id)}
              disabled={isAccepting || isRejecting}
              className="flex-1"
            >
              <X className="h-4 w-4 ml-2" />
              {isRejecting ? 'در حال رد...' : 'رد پیشنهاد'}
            </Button>
          </div>
        )}

        {/* Expiration */}
        {quote.expires_at && (
          <div className="text-xs text-gray-500 text-center">
            انقضا: {new Date(quote.expires_at).toLocaleDateString('fa-IR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
