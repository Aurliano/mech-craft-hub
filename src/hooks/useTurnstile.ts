import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface TurnstileConfig {
  siteKey: string;
  fallbackAvailable: boolean;
}

export const useTurnstile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<TurnstileConfig | null>(null);

  const getConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get site key from environment
      const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
      if (!siteKey) {
        throw new Error('Turnstile site key not configured');
      }

      // Check if fallback is available
      const fallbackStatus = await api.getFallbackCaptchaStatus();
      
      setConfig({
        siteKey,
        fallbackAvailable: fallbackStatus.available
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load Turnstile configuration';
      setError(errorMessage);
      console.error('Turnstile config error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = useCallback(async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This would be called by the parent component
      // The actual verification happens on the backend
      return token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Token verification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    config,
    isLoading,
    error,
    getConfig,
    verifyToken,
    clearError: () => setError(null)
  };
};
