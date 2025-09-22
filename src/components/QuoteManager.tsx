import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, Clock, User, CheckCircle, XCircle, 
  MessageCircle, Star, Award, Calendar, Package
} from 'lucide-react';

interface Quote {
  id: string;
  contractor: {
    username: string;
    profile_image?: string;
  };
  price: number;
  documentation_price: number;
  delivery_days: number;
  documentation_days: number;
  notes: string;
  status: string;
  created_at: string;
  expires_at?: string;
}

interface QuoteManagerProps {
  quotes: Quote[];
  onAcceptQuote: (quoteId: string) => void;
  onRejectQuote: (quoteId: string) => void;
  isLoading?: boolean;
}

const QuoteManager: React.FC<QuoteManagerProps> = ({
  quotes,
  onAcceptQuote,
  onRejectQuote,
  isLoading = false
}) => {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { 
        label: 'در انتظار', 
        variant: 'secondary' as const, 
        icon: Clock,
        color: 'text-gray-600'
      },
      'accepted': { 
        label: 'تایید شده', 
        variant: 'default' as const, 
        icon: CheckCircle,
        color: 'text-green-600'
      },
      'rejected': { 
        label: 'رد شده', 
        variant: 'destructive' as const, 
        icon: XCircle,
        color: 'text-red-600'
      },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: Clock,
      color: 'text-gray-600'
    };
    
    const IconComponent = statusInfo.icon;
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getTotalPrice = (quote: Quote) => {
    return quote.price + (quote.documentation_price || 0);
  };

  const getTotalDays = (quote: Quote) => {
    return quote.delivery_days + (quote.documentation_days || 0);
  };

  const handleAcceptQuote = async (quoteId: string) => {
    setActionLoading(quoteId);
    try {
      await onAcceptQuote(quoteId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    setActionLoading(quoteId);
    try {
      await onRejectQuote(quoteId);
    } finally {
      setActionLoading(null);
    }
  };

  const isExpired = (quote: Quote) => {
    if (!quote.expires_at) return false;
    return new Date(quote.expires_at) < new Date();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">پیشنهادی دریافت نکرده‌اید</h3>
          <p className="text-gray-600">
            پیمانکاران برای سفارش شما پیشنهاد ارسال نکرده‌اند
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <Card 
          key={quote.id} 
          className={`hover:shadow-md transition-shadow ${
            selectedQuote?.id === quote.id ? 'ring-2 ring-blue-500' : ''
          } ${isExpired(quote) ? 'opacity-60' : ''}`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {quote.contractor.profile_image ? (
                    <img 
                      src={quote.contractor.profile_image} 
                      alt={quote.contractor.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">{quote.contractor.username}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {new Date(quote.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(quote.status)}
                {isExpired(quote) && (
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    منقضی شده
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">قیمت اصلی:</span>
                <p className="text-green-600 font-semibold text-lg">
                  {quote.price.toLocaleString()} تومان
                </p>
              </div>
              
              {quote.documentation_price > 0 && (
                <div>
                  <span className="font-medium">قیمت مستندات:</span>
                  <p className="text-blue-600 font-semibold">
                    {quote.documentation_price.toLocaleString()} تومان
                  </p>
                </div>
              )}
              
              <div>
                <span className="font-medium">قیمت کل:</span>
                <p className="text-green-600 font-semibold text-lg">
                  {getTotalPrice(quote).toLocaleString()} تومان
                </p>
              </div>
              
              <div>
                <span className="font-medium">زمان تحویل:</span>
                <p className="text-orange-600 font-semibold">
                  {getTotalDays(quote)} روز
                </p>
              </div>
            </div>

            {quote.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm text-gray-600">یادداشت پیمانکار:</span>
                <p className="text-sm text-gray-700 mt-1">{quote.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                {quote.status === 'pending' && !isExpired(quote) && (
                  <>
                    <Button
                      onClick={() => handleAcceptQuote(quote.id)}
                      disabled={actionLoading === quote.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 ml-2" />
                      {actionLoading === quote.id ? 'در حال تایید...' : 'تایید پیشنهاد'}
                    </Button>
                    <Button
                      onClick={() => handleRejectQuote(quote.id)}
                      disabled={actionLoading === quote.id}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 ml-2" />
                      {actionLoading === quote.id ? 'در حال رد...' : 'رد پیشنهاد'}
                    </Button>
                  </>
                )}
                
                {quote.status === 'accepted' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">پیشنهاد تایید شده</span>
                  </div>
                )}
                
                {quote.status === 'rejected' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">پیشنهاد رد شده</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 ml-2" />
                  پیام
                </Button>
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 ml-2" />
                  امتیاز
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>تاریخ ارسال: {new Date(quote.created_at).toLocaleDateString('fa-IR')}</span>
              </div>
              {quote.expires_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>انقضا: {new Date(quote.expires_at).toLocaleDateString('fa-IR')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuoteManager;
