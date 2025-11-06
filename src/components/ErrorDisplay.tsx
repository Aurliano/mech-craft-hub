import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { 
  sanitizeError, 
  getErrorAction, 
  shouldShowRetryButton,
  SanitizedError 
} from '@/lib/errorSanitization';

interface ErrorDisplayProps {
  error: Error | string | unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showDismiss?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = "",
  showDismiss = true
}) => {
  if (!error) return null;

  const sanitizedError: SanitizedError = sanitizeError(error);
  const actionText = getErrorAction(sanitizedError);
  const showRetry = shouldShowRetryButton(sanitizedError) && onRetry;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <div>
          <p className="font-medium">{sanitizedError.message}</p>
          {sanitizedError.details && sanitizedError.details !== sanitizedError.message && (
            <p className="text-sm opacity-90 mt-1">{sanitizedError.details}</p>
          )}
          {!sanitizedError.details && actionText && (
            <p className="text-sm opacity-90 mt-1">{actionText}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8 px-3"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              تلاش مجدد
            </Button>
          )}
          
          {showDismiss && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 px-3"
            >
              <X className="h-3 w-3 mr-1" />
              بستن
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
