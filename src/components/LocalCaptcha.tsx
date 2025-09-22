import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocalCaptchaProps {
  onVerify: (answer: string) => void;
  onError?: (error: string) => void;
  challenge?: {
    id: string;
    question: string;
  };
  onRequestChallenge?: () => void;
  className?: string;
}

export const LocalCaptcha: React.FC<LocalCaptchaProps> = ({
  onVerify,
  onError,
  challenge,
  onRequestChallenge,
  className = ""
}) => {
  const [answer, setAnswer] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (onRequestChallenge && !challenge) {
      onRequestChallenge();
    }
  }, [challenge]);

  // Manual verification - no auto-verify

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      setError('لطفاً پاسخ را وارد کنید');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await onVerify(answer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در تایید کپچا';
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    setAnswer('');
    setError('');
    if (onRequestChallenge) {
      onRequestChallenge();
    }
  };

  // Auto-request new challenge when component mounts
  useEffect(() => {
    if (onRequestChallenge && !challenge) {
      onRequestChallenge();
    }
  }, [challenge, onRequestChallenge]);

  if (!challenge) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert>
          <AlertDescription>
            در حال بارگذاری کپچای محلی...
          </AlertDescription>
        </Alert>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onRequestChallenge}
          disabled={!onRequestChallenge}
        >
          دریافت کپچای جدید
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="captcha-question" className="text-sm font-medium text-gray-700">سوال ریاضی:</Label>
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-center text-xl font-bold text-blue-800" dir="ltr">
          {challenge.question}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="captcha-answer" className="text-sm font-medium text-gray-700">پاسخ شما:</Label>
        <Input
          id="captcha-answer"
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="عدد را وارد کنید"
          className="text-center text-lg font-mono border-2 focus:border-blue-500"
          dir="ltr"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={isVerifying || !answer.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          {isVerifying ? 'در حال تایید...' : 'تایید پاسخ'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleRetry}
          disabled={isVerifying}
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg"
        >
          سوال جدید
        </Button>
      </div>
    </div>
  );
};

export default LocalCaptcha;
