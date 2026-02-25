import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle, XCircle, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/api';
import { getCSRFToken } from '@/lib/csrfProtection';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';
import { formatPriceNumber } from '@/lib/priceUtils';

const TestPayment: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'redirecting' | 'success' | 'failed'>('idle');
  const [testOrderId, setTestOrderId] = useState<string | null>(null);

  // مبلغ تست: 50000 ریال = 5000 تومان
  const TEST_AMOUNT = 5000; // تومان

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'نیاز به ورود',
        description: 'برای تست پرداخت باید وارد حساب کاربری خود شوید',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // ایجاد سفارش تست
  const createTestOrder = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      // ابتدا یک سرویس تست پیدا کنیم
      const servicesResponse = await fetch(getApiUrl('/v1/services/'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!servicesResponse.ok) {
        throw new Error('خطا در دریافت سرویس‌ها');
      }

      const services = await servicesResponse.json();
      const firstService = services.results?.[0] || services[0];

      if (!firstService) {
        throw new Error('هیچ سرویسی یافت نشد');
      }

      // ایجاد سفارش تست
      const orderResponse = await fetch(getApiUrl('/v1/orders/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          service: firstService.id,
          description: 'سفارش تست برای پرداخت 5000 تومان',
          total_amount: TEST_AMOUNT,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.detail || 'خطا در ایجاد سفارش');
      }

      const orderData = await orderResponse.json();
      setTestOrderId(orderData.id);
      setOrderId(orderData.id);
      
      toast({
        title: 'سفارش تست ایجاد شد',
        description: `شناسه سفارش: ${orderData.order_number || orderData.id}`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در ایجاد سفارش تست';
      setError(errorMessage);
      toast({
        title: 'خطا',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // شروع پرداخت
  const initiatePayment = async () => {
    if (!orderId || !token) {
      setError('لطفاً ابتدا یک سفارش ایجاد کنید یا شناسه سفارش را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');
    setPaymentStatus('initiating');

    try {
      const response = await fetch(getApiUrl('/v1/payments/initiate/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          order: orderId,
          amount: TEST_AMOUNT,
          payment_type: 'material',
          description: 'پرداخت تست - 5000 تومان',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'خطا در شروع پرداخت');
      }

      const data = await response.json();

      if (data.redirect_url) {
        setPaymentUrl(data.redirect_url);
        setPaymentStatus('redirecting');
        
        toast({
          title: 'در حال هدایت به درگاه پرداخت',
          description: 'لطفاً صبر کنید...',
        });

        // هدایت به درگاه پرداخت
        setTimeout(() => {
          window.location.href = data.redirect_url;
        }, 1000);
      } else {
        throw new Error('لینک پرداخت دریافت نشد');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در شروع پرداخت';
      setError(errorMessage);
      setPaymentStatus('failed');
      toast({
        title: 'خطا',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">تست درگاه پرداخت BitPay</h1>
            <p className="text-muted-foreground">
              این صفحه برای تست درگاه پرداخت با مبلغ <strong>5000 تومان</strong> (50000 ریال) طراحی شده است
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                اطلاعات پرداخت تست
              </CardTitle>
              <CardDescription>
                مبلغ تست: {formatPriceNumber(TEST_AMOUNT)} تومان ({TEST_AMOUNT * 10} ریال)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ایجاد سفارش تست */}
              <div className="space-y-2">
                <Label>گام 1: ایجاد سفارش تست</Label>
                <Button
                  onClick={createTestOrder}
                  disabled={loading || !!testOrderId}
                  className="w-full"
                  variant={testOrderId ? 'outline' : 'default'}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      در حال ایجاد...
                    </>
                  ) : testOrderId ? (
                    <>
                      <CheckCircle className="w-4 h-4 ml-2" />
                      سفارش تست ایجاد شد
                    </>
                  ) : (
                    'ایجاد سفارش تست'
                  )}
                </Button>
                {testOrderId && (
                  <p className="text-sm text-muted-foreground">
                    شناسه سفارش: <code className="bg-muted px-2 py-1 rounded">{testOrderId}</code>
                  </p>
                )}
              </div>

              {/* وارد کردن شناسه سفارش */}
              <div className="space-y-2">
                <Label htmlFor="orderId">یا شناسه سفارش موجود را وارد کنید:</Label>
                <Input
                  id="orderId"
                  type="text"
                  placeholder="شناسه سفارش (UUID)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* شروع پرداخت */}
              <div className="space-y-2">
                <Label>گام 2: شروع پرداخت</Label>
                <Button
                  onClick={initiatePayment}
                  disabled={loading || !orderId || paymentStatus === 'redirecting'}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      {paymentStatus === 'initiating' ? 'در حال اتصال به درگاه...' : 'در حال پردازش...'}
                    </>
                  ) : paymentStatus === 'redirecting' ? (
                    <>
                      <ArrowRight className="w-4 h-4 ml-2" />
                      در حال هدایت به درگاه پرداخت...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 ml-2" />
                      شروع پرداخت {formatPriceNumber(TEST_AMOUNT)} تومان
                    </>
                  )}
                </Button>
              </div>

              {/* نمایش خطا */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* نمایش لینک پرداخت */}
              {paymentUrl && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p className="mb-2">لینک پرداخت:</p>
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {paymentUrl}
                    </a>
                    <p className="mt-2 text-sm text-muted-foreground">
                      اگر به صورت خودکار هدایت نشدید، روی لینک بالا کلیک کنید.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* راهنمای استفاده */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">راهنمای استفاده:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>روی دکمه "ایجاد سفارش تست" کلیک کنید تا یک سفارش تست ایجاد شود</li>
                    <li>یا شناسه یک سفارش موجود را وارد کنید</li>
                    <li>روی دکمه "شروع پرداخت" کلیک کنید</li>
                    <li>به درگاه BitPay هدایت می‌شوید</li>
                    <li>پرداخت را در درگاه تکمیل کنید</li>
                    <li>پس از پرداخت، به سایت بازمی‌گردید</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* اطلاعات اضافی */}
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات فنی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong>Endpoint:</strong> <code className="bg-muted px-2 py-1 rounded">POST /api/v1/payments/initiate/</code>
              </div>
              <div>
                <strong>مبلغ:</strong> {formatPriceNumber(TEST_AMOUNT)} تومان ({TEST_AMOUNT * 10} ریال)
              </div>
              <div>
                <strong>نوع پرداخت:</strong> material (پرداخت متریال)
              </div>
              <div>
                <strong>درگاه:</strong> BitPay
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TestPayment;

