import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { getOrderPaymentSummary, initiatePaymentPhase, type OrderPaymentSummary } from '@/lib/api';
import { formatPriceNumber } from '@/lib/priceUtils';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface OrderPaymentPhasesProps {
  orderId: string;
  orderNumber: string;
  totalAmount?: number;
  onPaymentInitiated?: () => void;
}

export function OrderPaymentPhases({ orderId, orderNumber, totalAmount, onPaymentInitiated }: OrderPaymentPhasesProps) {
  const [payingPhase, setPayingPhase] = useState<number | null>(null);

  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ['orderPaymentSummary', orderId],
    queryFn: () => getOrderPaymentSummary(orderId),
    enabled: !!orderId,
  });

  const handlePayPhase = async (phase: 1 | 2 | 3 | 4) => {
    setPayingPhase(phase);
    try {
      const res = await initiatePaymentPhase(orderId, phase);
      if (res.redirect_url) {
        onPaymentInitiated?.();
        window.location.href = res.redirect_url;
      }
    } catch (err) {
      console.error('Error initiating payment:', err);
      setPayingPhase(null);
    }
  };

  if (isLoading || !summary) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>در حال بارگذاری...</span>
      </div>
    );
  }

  const proj = summary.project;
  const phases = [
    { n: 1, data: proj.phase_1 },
    { n: 2, data: proj.phase_2 },
    { n: 3, data: proj.phase_3 },
    { n: 4, data: proj.phase_4 },
  ];
  const paidCount = phases.filter((p) => p.data.is_paid).length;
  const progressPercent = (paidCount / 4) * 100;

  return (
    <Card className="bg-blue-50/50 border-blue-200">
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-blue-800">پیشرفت پرداخت (۴ مرحله‌ای)</span>
            <span className="text-blue-600">{paidCount} از ۴ مرحله پرداخت شده</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {phases.map(({ n, data }) => (
            <div
              key={n}
              className={`p-3 rounded-lg border ${
                data.is_paid ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-sm">مرحله {n}</span>
                {data.is_paid && <CheckCircle className="h-4 w-4 text-green-600" />}
              </div>
              <p className="text-lg font-bold text-green-700 mb-2">
                {formatPriceNumber(data.amount)} <span className="text-xs font-normal">تومان</span>
              </p>
              {data.is_paid ? (
                <span className="text-xs text-green-600">پرداخت شده</span>
              ) : (
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handlePayPhase(n as 1 | 2 | 3 | 4)}
                  disabled={payingPhase !== null}
                >
                  {payingPhase === n ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 ml-2" />
                      پرداخت {n} (۲۵٪)
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/orders/${orderId}`}>مشاهده جزئیات</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
