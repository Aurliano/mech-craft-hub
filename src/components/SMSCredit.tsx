import React, { useState, useEffect } from 'react';
import { getSMSCredit } from '../lib/api';

interface SMSCreditProps {
  className?: string;
}

export default function SMSCredit({ className = '' }: SMSCreditProps) {
  const [credit, setCredit] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCredit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getSMSCredit();
      setCredit(response.credit);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت اعتبار پیامک');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredit();
  }, []);

  const getCreditStatus = (credit: number) => {
    if (credit > 100) return { color: 'text-green-600', bg: 'bg-green-100', status: 'عالی' };
    if (credit > 50) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'متوسط' };
    if (credit > 10) return { color: 'text-orange-600', bg: 'bg-orange-100', status: 'کم' };
    return { color: 'text-red-600', bg: 'bg-red-100', status: 'بحرانی' };
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">
              خطا در دریافت اعتبار پیامک: {error}
            </div>
            <button
              onClick={fetchCredit}
              className="ml-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (credit === null) return null;

  const status = getCreditStatus(credit);

  return (
    <div className={`${className}`}>
      <div className={`${status.bg} border rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-sm font-medium ${status.color}`}>
              اعتبار پیامک
            </h3>
            <p className={`text-2xl font-bold ${status.color}`}>
              {credit.toLocaleString('fa-IR')}
            </p>
            <p className={`text-xs ${status.color}`}>
              وضعیت: {status.status}
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={fetchCredit}
              className="text-gray-500 hover:text-gray-700 text-sm"
              title="بروزرسانی"
            >
              🔄
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
