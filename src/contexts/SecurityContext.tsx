import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { csrfTokenManager, refreshCSRFToken } from '@/lib/csrfProtection';

interface SecurityContextType {
  csrfToken: string | null;
  refreshCSRFToken: () => Promise<boolean>;
  isSecure: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [csrfToken, setCsrfToken] = React.useState<string | null>(null);
  const [isSecure, setIsSecure] = React.useState<boolean>(false);

  useEffect(() => {
    // Initialize CSRF token
    const initializeSecurity = async () => {
      try {
        const refreshed = await refreshCSRFToken();
        if (refreshed) {
          setCsrfToken(csrfTokenManager.getToken());
          setIsSecure(true);
        }
      } catch (error) {
        console.error('Failed to initialize security:', error);
        setIsSecure(false);
      }
    };

    initializeSecurity();
  }, []);

  const handleRefreshCSRFToken = async (): Promise<boolean> => {
    try {
      const refreshed = await refreshCSRFToken();
      if (refreshed) {
        setCsrfToken(csrfTokenManager.getToken());
        setIsSecure(true);
        return true;
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    }
    return false;
  };

  const contextValue: SecurityContextType = {
    csrfToken,
    refreshCSRFToken: handleRefreshCSRFToken,
    isSecure
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

// Security utilities
export const SecurityUtils = {
  // Check if current environment is secure
  isSecureEnvironment: (): boolean => {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  },

  // Generate secure random string
  generateSecureToken: (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    
    return result;
  },

  // Sanitize user input
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  // Validate URL
  isValidUrl: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  },

  // Check for XSS patterns
  containsXSS: (input: string): boolean => {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<link/i,
      /<meta/i,
      /expression\s*\(/i,
      /url\s*\(/i
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }
};
