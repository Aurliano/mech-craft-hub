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
  }, [onRequestChallenge, challenge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      setError('لطفاً پاسخ را وارد کنید');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      onVerify(answer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در تایید کپچا';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
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
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">کپچای محلی</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="captcha-question">سوال:</Label>
            <div className="p-3 bg-muted rounded-md text-center text-lg font-mono">
              {challenge.question}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="captcha-answer">پاسخ:</Label>
            <Input
              id="captcha-answer"
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="پاسخ خود را وارد کنید"
              className="text-center"
              dir="ltr"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isVerifying || !answer.trim()}
              className="flex-1"
            >
              {isVerifying ? 'در حال تایید...' : 'تایید'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleRetry}
              disabled={isVerifying}
            >
              کپچای جدید
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LocalCaptcha;
