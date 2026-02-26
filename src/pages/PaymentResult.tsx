import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ShoppingCart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { formatPriceNumber } from '@/lib/priceUtils';

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  material: 'پرداخت متریال',
  project_advance: 'پیش‌پرداخت پروژه',
  project_final: 'تسویه نهایی پروژه',
  project_phase_1: 'مرحله ۱ (۲۵٪)',
  project_phase_2: 'مرحله ۲ (۲۵٪)',
  project_phase_3: 'مرحله ۳ (۲۵٪)',
  project_phase_4: 'مرحله ۴ (۲۵٪)',
  shipping: 'هزینه ارسال',
};

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const orderId = searchParams.get('order_id') || '';
  const amountToman = searchParams.get('amount_toman') || '';
  const paymentType = searchParams.get('payment_type') || '';
  const detail = searchParams.get('detail') || '';

  const isSuccess = status === 'success';

  const handleBackToCart = () => {
    window.location.href = '/cart';
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-lg mx-auto">
          <Card className={isSuccess ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {isSuccess ? (
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-600" />
                )}
                <div>
                  <CardTitle className="text-xl">
                    {isSuccess ? 'پرداخت با موفقیت انجام شد' : 'پرداخت انجام نشد'}
                  </CardTitle>
                  <CardDescription>
                    {isSuccess
                      ? 'مبلغ با موفقیت از حساب شما کسر و به سفارش شما اعمال شد.'
                      : 'تراکنش لغو شده یا ناموفق بوده است.'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSuccess && (
                <div className="rounded-lg bg-white/80 p-4 space-y-2 text-sm">
                  {paymentType && (
                    <p>
                      <span className="font-medium text-gray-600">نوع پرداخت:</span>{' '}
                      {PAYMENT_TYPE_LABELS[paymentType] || paymentType}
                    </p>
                  )}
                  {amountToman && (
                    <p>
                      <span className="font-medium text-gray-600">مبلغ:</span>{' '}
                      {formatPriceNumber(amountToman)} تومان
                    </p>
                  )}
                  {orderId && (
                    <p>
                      <span className="font-medium text-gray-600">شناسه سفارش:</span>{' '}
                      <span className="font-mono text-xs">{orderId}</span>
                    </p>
                  )}
                </div>
              )}
              {!isSuccess && detail && (
                <p className="text-red-700 text-sm rounded-lg bg-white/80 p-3">{detail}</p>
              )}
              <Button
                onClick={handleBackToCart}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 ml-2" />
                بازگشت به سبد خرید
              </Button>
              <p className="text-xs text-center text-gray-500">
                با کلیک روی دکمه بالا، صفحه سبد خرید با آخرین وضعیت به‌روز می‌شود.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
