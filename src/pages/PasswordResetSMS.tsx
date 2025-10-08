import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { passwordResetRequestSMS, phoneVerificationConfirm } from '../lib/api';

export default function PasswordResetSMS() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('لطفاً ایمیل خود را وارد کنید');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await passwordResetRequestSMS(email);
      setMessage(response.detail);
      setPhone(response.phone || ''); // Store phone for verification
      setStep('code');
      setCountdown(600); // 10 minutes
      
      // Show code in development mode
      if (response.code) {
        console.log('Password reset code (development):', response.code);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ارسال کد بازیابی');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('لطفاً کد 6 رقمی را وارد کنید');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Just verify the code, don't reset password yet
      await phoneVerificationConfirm(phone, code);
      setMessage('کد تأیید شد. حالا می‌توانید رمز عبور جدید را تنظیم کنید');
      setStep('success');
      
      // Redirect to password reset form
      setTimeout(() => {
        navigate('/reset-password', { 
          state: { 
            email, 
            phone, 
            verified: true,
            smsCode: code
          } 
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'کد تأیید نامعتبر است');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await passwordResetRequestSMS(email);
      setMessage('کد جدید ارسال شد');
      setCountdown(600);
      
      // Show code in development mode
      if (response.code) {
        console.log('Password reset code (development):', response.code);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ارسال مجدد کد');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            بازیابی رمز عبور با پیامک
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'email' 
              ? 'ایمیل خود را وارد کنید تا کد بازیابی به شماره تلفن شما ارسال شود'
              : step === 'code'
              ? 'کد ارسال شده به شماره تلفن خود را وارد کنید'
              : 'کد تأیید شد. در حال انتقال...'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'email' && (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  ایمیل
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              {message && (
                <div className="text-green-600 text-sm text-center">{message}</div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'در حال ارسال...' : 'ارسال کد بازیابی'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  بازیابی با ایمیل
                </button>
              </div>
            </form>
          )}

          {step === 'code' && (
            <form className="space-y-6" onSubmit={handleCodeSubmit}>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  کد بازیابی
                </label>
                <div className="mt-1">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center text-lg tracking-widest"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  کد 6 رقمی ارسال شده به شماره تلفن شما را وارد کنید
                </p>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              {message && (
                <div className="text-green-600 text-sm text-center">{message}</div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'در حال تأیید...' : 'تأیید کد'}
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {countdown > 0 ? `ارسال مجدد (${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')})` : 'ارسال مجدد کد'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full flex justify-center py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  تغییر ایمیل
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="text-green-600 text-lg font-medium mb-4">
                ✓ کد تأیید شد
              </div>
              <p className="text-gray-600">
                در حال انتقال به صفحه تنظیم رمز عبور جدید...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}