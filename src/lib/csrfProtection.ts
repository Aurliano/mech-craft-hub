/**
 * CSRF Token utilities for frontend
 */
import { getAccessToken, getApiUrl } from './api';

export interface CSRFConfig {
  token: string | null;
  headerName: string;
  cookieName: string;
}

class CSRFTokenManager {
  private token: string | null = null;
  private readonly headerName = 'X-CSRFToken';
  private readonly cookieName = 'csrftoken';

  constructor() {
    this.loadTokenFromCookie();
  }

  private loadTokenFromCookie(): void {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.cookieName) {
        this.token = value;
        break;
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(token: string): void {
    this.token = token;
  }

  public getHeaderName(): string {
    return this.headerName;
  }

  public getCookieName(): string {
    return this.cookieName;
  }

  public isTokenValid(): boolean {
    return this.token !== null && this.token.length > 0;
  }

  public async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(getApiUrl('/csrf-token/'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.csrfToken);
        return true;
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    }
    return false;
  }

  public getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.isTokenValid()) {
      headers[this.headerName] = this.token!;
    }

    // Add authorization header if available
    const accessToken = getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }
}

// Singleton instance
export const csrfTokenManager = new CSRFTokenManager();

// Utility functions
export const getCSRFToken = (): string | null => {
  return csrfTokenManager.getToken();
};

export const setCSRFToken = (token: string): void => {
  csrfTokenManager.setToken(token);
};

export const getCSRFHeaders = (): Record<string, string> => {
  return csrfTokenManager.getHeaders();
};

export const refreshCSRFToken = (): Promise<boolean> => {
  return csrfTokenManager.refreshToken();
};

// Enhanced fetch function with CSRF protection
export const fetchWithCSRF = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const csrfHeaders = getCSRFHeaders();
  
  const enhancedOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...csrfHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(url, enhancedOptions);

  // If CSRF token is invalid, try to refresh and retry once
  if (response.status === 403 && response.headers.get('X-CSRF-Required')) {
    const refreshed = await refreshCSRFToken();
    if (refreshed) {
      const retryHeaders = getCSRFHeaders();
      const retryOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...retryHeaders,
          ...options.headers,
        },
        credentials: 'include',
      };
      return fetch(url, retryOptions);
    }
  }

  return response;
};
