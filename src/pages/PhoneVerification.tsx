import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { phoneVerificationRequest, phoneVerificationConfirm, verifyUserPhone } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { navigateToLogin, navigateWithRefresh } from '../lib/navigation';

interface PhoneVerificationProps {
  mode?: 'register' | 'reset' | 'verify';
  phone?: string;
}

export default function PhoneVerification({ mode = 'verify', phone: initialPhone }: PhoneVerificationProps) {
  const [phone, setPhone] = useState(initialPhone || '');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get phone from URL params if available
  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    if (phoneParam) {
      setPhone(phoneParam);
    }
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as Iranian phone number
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length <= 11) return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
    
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('لطفاً شماره تلفن را وارد کنید');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      let response;
      
      if (mode === 'verify' && user) {
        // For authenticated users verifying their phone
        response = await verifyUserPhone(phone);
      } else {
        // For registration or password reset
        response = await phoneVerificationRequest(phone);
      }

      setMessage(response.detail);
      setStep('code');
      setCountdown(120); // 2 minutes
      
      // Show code in development mode
      if (response.code) {
        console.log('Verification code (development):', response.code);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ارسال کد تأیید');
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
      await phoneVerificationConfirm(phone, code);
      setMessage('شماره تلفن با موفقیت تأیید شد');
      
      // Clear any old tokens before redirecting
      if (mode === 'register' || mode === 'reset') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      
      // Redirect based on mode with proper navigation
      setTimeout(() => {
        if (mode === 'register') {
          navigateToLogin(navigate);
        } else if (mode === 'reset') {
          navigateWithRefresh('/reset-password', navigate);
        } else {
          navigateWithRefresh('/dashboard', navigate);
        }
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'کد تأیید نامعتبر است');
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
      let response;
      
      if (mode === 'verify' && user) {
        response = await verifyUserPhone(phone);
      } else {
        response = await phoneVerificationRequest(phone);
      }

      setMessage('کد جدید ارسال شد');
      setCountdown(120);
      
      // Show code in development mode
      if (response.code) {
        console.log('Verification code (development):', response.code);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ارسال مجدد کد');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {mode === 'register' && 'تأیید شماره تلفن برای ثبت نام'}
            {mode === 'reset' && 'تأیید شماره تلفن برای بازیابی رمز عبور'}
            {mode === 'verify' && 'تأیید شماره تلفن'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'phone' 
              ? 'شماره تلفن خود را وارد کنید تا کد تأیید ارسال شود'
              : 'کد تأیید ارسال شده به شماره تلفن خود را وارد کنید'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'phone' ? (
            <form className="space-y-6" onSubmit={handlePhoneSubmit}>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  شماره تلفن
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    placeholder="0912-345-6789"
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
                  {isLoading ? 'در حال ارسال...' : 'ارسال کد تأیید'}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleCodeSubmit}>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  کد تأیید
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
                  کد 6 رقمی ارسال شده به شماره {phone} را وارد کنید
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
                  {countdown > 0 ? `ارسال مجدد (${countdown} ثانیه)` : 'ارسال مجدد کد'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full flex justify-center py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  تغییر شماره تلفن
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}