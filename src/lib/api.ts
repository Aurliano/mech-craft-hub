// Type definitions for import.meta.env
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type definitions for API responses
export interface Ticket {
  id: string;
  subject: string;
  category_name: string;
  status: string;
  priority: string;
  creator_name: string;
  order_number?: string;
  created_at: string;
  last_activity_at: string;
  messages_count?: number;
}

export interface TicketMessage {
  id: string;
  sender: string;
  sender_name: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  attachments: unknown[];
}

// API_BASE_URL is only used in development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// API_ROOT should always use relative path in production
export const API_ROOT = '/api';

// Utility function to get the correct API URL for both development and production
// Version: 2025-11-11 - Use relative URLs in production for better reliability
export function getApiUrl(endpoint: string): string {
  // Check for VITE_API_BASE_URL only in development
  // In production, we should NOT use VITE_API_BASE_URL to avoid hardcoded URLs
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Only use VITE_API_BASE_URL if we're actually in development (localhost)
  if (envApiUrl && typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || 
                       hostname === '127.0.0.1' ||
                       hostname.startsWith('192.168.') ||
                       hostname.startsWith('10.') ||
                       hostname.startsWith('172.');
    
    // Only use VITE_API_BASE_URL if we're on localhost
    if (isLocalhost) {
      const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
      const finalUrl = `${envApiUrl}${apiEndpoint}`;
      return finalUrl;
    }
    // In production, ignore VITE_API_BASE_URL even if it's set
  }
  
  // Ensure endpoint starts with /api (both development and production)
  const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  
  // Default to relative URLs (production mode)
  // Only use localhost if we're explicitly on localhost
  let useLocalhost = false;
  let hostname = '';
  
  if (typeof window !== 'undefined' && window.location) {
    hostname = window.location.hostname;
    
    // Explicitly check for production domains first
    const isProductionDomain = hostname === 'saydatech.ir' || 
                              hostname === 'www.saydatech.ir' ||
                              hostname.endsWith('.liara.run') ||
                              hostname.endsWith('.liara.ir');
    
    // Only use localhost if we're NOT on a production domain AND we're on localhost
    useLocalhost = !isProductionDomain && (
      hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    );
  }
  
  if (useLocalhost) {
    // Development mode - use localhost
    const baseUrl = 'http://127.0.0.1:8000';
    const finalUrl = `${baseUrl}${apiEndpoint}`;
    return finalUrl;
  } else {
    // Production mode - use relative URLs (same domain as frontend)
    // This ensures requests go to the same domain and avoids CORS issues
    return apiEndpoint;
  }
}

import { requestQueue } from './requestQueue';
import { getCSRFToken } from './csrfProtection';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  const refreshToken = getRefreshToken();
  return Boolean(token && refreshToken);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log('No refresh token available');
    return null;
  }

  try {
    console.log('Attempting to refresh token...');
    const res = await fetch(getApiUrl('/v1/auth/refresh/'), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken() || '',
      },
      credentials: 'include',
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      console.error('Token refresh failed with status:', res.status);
      const errorText = await res.text();
      console.error('Token refresh error:', errorText);
      clearTokens();
      return null;
    }

    const data = await res.json();
    console.log('Token refresh successful');
    setTokens(data.access, data.refresh || refreshToken);
    return data.access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    return null;
  }
}

/**
 * Parse error response and extract user-friendly message
 */
function parseErrorResponse(errorText: string, defaultMessage: string = 'خطایی رخ داده است'): string {
  if (!errorText) {
    return defaultMessage;
  }

  // Try to parse as JSON first
  if (errorText.trim().startsWith('{') || errorText.trim().startsWith('[')) {
    try {
      const errorData = JSON.parse(errorText);
      // Check for our custom error format
      if (errorData.message) {
        return errorData.message;
      } else if (errorData.detail) {
        return errorData.detail;
      } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors) && errorData.non_field_errors.length > 0) {
        return errorData.non_field_errors[0];
      } else if (typeof errorData === 'string') {
        return errorData;
      }
    } catch {
      // If JSON parsing fails, try to extract message using regex
      if (errorText.includes('non_field_errors')) {
        const match = errorText.match(/"non_field_errors":\s*\["([^"]+)"/);
        if (match && match[1]) {
          return match[1];
        } else {
          // Try to extract any message field
          const messageMatch = errorText.match(/"message":\s*"([^"]+)"/);
          if (messageMatch && messageMatch[1]) {
            return messageMatch[1];
          }
        }
      } else {
        // Try to extract message field
        const messageMatch = errorText.match(/"message":\s*"([^"]+)"/);
        if (messageMatch && messageMatch[1]) {
          return messageMatch[1];
        }
      }
    }
  }
  
  // Not JSON, use as is
  return errorText;
}

/**
 * Create a properly formatted error from response
 */
async function createErrorFromResponse(res: Response, defaultMessage: string = 'خطایی رخ داده است'): Promise<Error> {
  const errorText = await res.text();
  const errorMessage = parseErrorResponse(errorText, defaultMessage);
  const error = new Error(errorMessage);
  // Add response info to error for better error handling
  Object.assign(error, {
    response: { status: res.status, data: { message: errorMessage } }
  });
  return error;
}

// Simple fetch function without retry logic
async function simpleFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCSRFToken() || '',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(getApiUrl(path), {
    ...options,
    headers,
    credentials: 'include',
  });
  
  // Check for "User not found" even in first request
  if (res.status === 401 && token) {
    const clonedRes = res.clone();
    try {
      const errorData = await clonedRes.json();
      if (errorData.detail?.includes('User not found') || errorData.code === 'user_not_found') {
        console.warn('User not found - clearing stale tokens');
        clearTokens();
        window.location.href = '/login';
        throw new Error('User not found. Please log in again.');
      }
    } catch (e) {
      // If JSON parse fails, continue with normal flow
    }
  }

  // If token expired, try to refresh
  if (res.status === 401 && token) {
    console.log('Token expired, attempting refresh...');
    const newToken = await refreshAccessToken();
    if (newToken) {
      console.log('Token refreshed successfully, retrying request...');
      // Retry the request with new token
      const retryHeaders = { 
        ...headers, 
        'Authorization': `Bearer ${newToken}`,
        'X-CSRFToken': getCSRFToken() || '',
      };
      const retryRes = await fetch(getApiUrl(path), {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      });
      if (!retryRes.ok) {
        const text = await retryRes.text();
        console.error('Retry request failed:', text);
        
        // If user not found after token refresh, clear tokens and redirect
        if (text.includes('User not found') || text.includes('user_not_found')) {
          console.log('User not found, clearing tokens and redirecting to login');
          clearTokens();
          window.location.href = '/login';
        }
        
        throw new Error(text || retryRes.statusText);
      }
      if (retryRes.status === 204) return undefined as unknown as T;
      return (await retryRes.json()) as T;
    } else {
      // If refresh failed, clear tokens and redirect to login
      console.log('Token refresh failed, clearing tokens and redirecting to login');
      clearTokens();
      // Redirect to login page
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!res.ok) {
    throw await createErrorFromResponse(res, res.statusText || 'خطایی رخ داده است');
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// Queue-based fetch function with rate limiting
export async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isProduction = import.meta.env.PROD;
  if (isProduction) {
    // In production, use direct fetch to avoid queue issues
    return simpleFetch<T>(path, options);
  } else {
    // In development, use queue for rate limiting
    return requestQueue.add(() => simpleFetch<T>(path, options), 2);
  }
}



export async function loginRequest(params: { 
  username: string; 
  password: string;
  fallback_captcha_challenge_id?: string;
  fallback_captcha_answer?: string;
}) {
  const res = await fetch(getApiUrl('/v1/auth/login/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'نام کاربری یا رمز عبور اشتباه است');
  }
  const data = (await res.json()) as { access: string; refresh: string } & Record<string, unknown>;
  // Persist tokens for subsequent authenticated requests
  if (data?.access && data?.refresh) {
    setTokens(data.access, data.refresh);
  }
  return data;
}

export async function customerRegisterRequest(params: { 
  username: string; 
  email: string; 
  phone: string; 
  password: string;
  first_name?: string;
  last_name?: string;
  turnstile_token?: string;
}) {
  const res = await fetch(getApiUrl('/v1/auth/customer-register/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });
    if (!res.ok) {
      throw await createErrorFromResponse(res, 'ثبت نام ناموفق بود');
    }
  return (await res.json()) as unknown;
}

export async function contractorRegisterRequest(params: { 
  username: string; 
  email: string; 
  phone: string; 
  password: string;
  first_name?: string;
  last_name?: string;
  selected_scope?: string;
  selected_services?: string[];
  turnstile_token?: string;
}) {
  const res = await fetch(getApiUrl('/v1/auth/contractor-register/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });
    if (!res.ok) {
      throw await createErrorFromResponse(res, 'ثبت نام پیمانکار ناموفق بود');
    }
  return (await res.json()) as unknown;
}

export async function specialistRegisterRequest(params: { 
  username: string; 
  email: string; 
  phone: string; 
  password: string;
  first_name?: string;
  last_name?: string;
  turnstile_token?: string;
}) {
  const res = await fetch(getApiUrl('/v1/auth/specialist-register/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });
    if (!res.ok) {
      throw await createErrorFromResponse(res, 'ثبت نام نیروی متخصص ناموفق بود');
    }
  return (await res.json()) as unknown;
}

export async function meRequest(): Promise<{ id: string; username: string; email: string; first_name?: string; last_name?: string; roles?: { role?: { name?: string } }[]; role?: { name?: string } }> {
  return fetchJson<{ id: string; username: string; email: string; first_name?: string; last_name?: string; roles?: { role?: { name?: string } }[]; role?: { name?: string } }>('/v1/auth/me/', { method: 'GET' });
}

export async function getAllServices(): Promise<{ id: string; name: string; type: string; has_tabs?: boolean }[]> {
  try {
    const response = await fetchJson<{ id: string; name: string; type: string; has_tabs?: boolean }[]>('/v1/services/');
    return Array.isArray(response) ? response : ((response as { results?: { id: string; name: string; type: string; has_tabs?: boolean }[] }).results || []);
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function getServiceFields(serviceId: string, tabId?: string): Promise<{ id: string; name: string; field_key: string; type: string; options?: { value: string; label: string }[]; is_required: boolean; order: number; help_text?: string }[]> {
  try {
    const url = tabId 
      ? `/v1/service-fields/?service=${serviceId}&tab=${tabId}`
      : `/v1/service-fields/?service=${serviceId}`;
    const response = await fetchJson<{ id: string; name: string; field_key: string; type: string; options?: { value: string; label: string }[]; is_required: boolean; order: number; help_text?: string }[]>(url);
    // اگر response یک object با results است، results را برگردان، وگرنه خود response را
    return Array.isArray(response) ? response : ((response as { results?: { id: string; name: string; field_key: string; type: string; options?: { value: string; label: string }[]; is_required: boolean; order: number; help_text?: string }[] }).results || []);
  } catch (error) {
    console.error('Error fetching service fields:', error);
    return [];
  }
}

export async function getServiceTabs(serviceId: string): Promise<{ id: string; name: string; display_name: string; description?: string; order: number; is_active: boolean }[]> {
  try {
    const response = await fetchJson<{ id: string; name: string; display_name: string; description?: string; order: number; is_active: boolean }[]>(`/v1/service-tabs/?service=${serviceId}`);
    return Array.isArray(response) ? response : ((response as { results?: { id: string; name: string; display_name: string; description?: string; order: number; is_active: boolean }[] }).results || []);
  } catch (error) {
    console.error('Error fetching service tabs:', error);
    return [];
  }
}

export async function getTabFields(tabId: string): Promise<{ id: string; name: string; field_key: string; type: string; options?: { value: string; label: string }[]; is_required: boolean; order: number; help_text?: string }[]> {
  try {
    const response = await fetchJson<{ id: string; name: string; field_key: string; type: string; options?: { value: string; label: string }[]; is_required: boolean; order: number; help_text?: string }[]>(`/v1/service-fields/?tab=${tabId}`);
    return Array.isArray(response) ? response : ((response as { results?: { id: string; name: string; field_key: string; type: string; options?: { value: string; label: string }[]; is_required: boolean; order: number; help_text?: string }[] }).results || []);
  } catch (error) {
    console.error('Error fetching tab fields:', error);
    return [];
  }
}

export async function createCart(customer: string): Promise<{ id: string; customer: string; created_at: string }> {
  return fetchJson<{ id: string; customer: string; created_at: string }>('/v1/carts/', {
    method: 'POST',
    body: JSON.stringify({ customer }),
  });
}

export async function createCartItem(data: {
  cart: string;
  service: string;
  field_values: Record<string, unknown>;
  needs_documentation?: boolean;
}): Promise<{ id: string; cart: string; service: string; field_values: Record<string, unknown>; needs_documentation?: boolean; created_at: string }> {
  return fetchJson<{ id: string; cart: string; service: string; field_values: Record<string, unknown>; needs_documentation?: boolean; created_at: string }>('/v1/cart-items/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


// Upload private user files (workshops, orders, etc.) - returns file_path
export async function uploadUserFile(file: File, orderId?: string, retries = 3): Promise<{ file_path: string; download_endpoint: string; file_size: number }> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const form = new FormData();
      form.append('file', file);
      if (orderId) form.append('order_id', orderId);

      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);
      headers.append('X-CSRFToken', getCSRFToken() || '');

      console.log(`Upload user file attempt ${attempt}/${retries}:`, file.name, 'Size:', file.size);

      const res = await fetch(getApiUrl('/v1/user-files/upload/'), {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: form,
      });

      if (!res.ok) {
        if (attempt === retries) {
          const error = await createErrorFromResponse(res, 'آپلود فایل ناموفق بود');
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      const result = await res.json();
      console.log('Upload success:', result);
      return {
        file_path: result.file_path,
        download_endpoint: result.download_endpoint,
        file_size: result.file_size
      };
    } catch (error) {
      console.error(`Upload error attempt ${attempt}:`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('Upload failed after all retries');
}

// Legacy upload function for public files (kept for backward compatibility)
export async function uploadFile(file: File, extra?: { context?: string; context_id?: string }, retries = 3): Promise<{ id: string; url: string; original_name: string }> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const form = new FormData();
      form.append('file', file);
      if (extra?.context) form.append('context', extra.context);
      if (extra?.context_id) form.append('context_id', extra.context_id);

      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);
      headers.append('X-CSRFToken', getCSRFToken() || '');

      console.log(`Upload attempt ${attempt}/${retries}:`, file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('Extra data:', extra);

      const res = await fetch(getApiUrl('/v1/upload/'), {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: form,
      });

      console.log('Upload response status:', res.status);

      if (!res.ok) {
        if (attempt === retries) {
          let defaultMessage = 'آپلود فایل ناموفق بود';
          // Handle specific status codes
          if (res.status === 413) {
            defaultMessage = 'حجم فایل بیش از حد مجاز است. لطفاً فایل کوچکتری انتخاب کنید';
          } else if (res.status === 415) {
            defaultMessage = 'نوع فایل پشتیبانی نمی‌شود. لطفاً فایل با فرمت مناسب ارسال کنید';
          } else if (res.status === 401) {
            defaultMessage = 'لطفاً وارد حساب کاربری خود شوید';
          } else if (res.status === 403) {
            defaultMessage = 'شما مجاز به آپلود فایل نیستید';
          } else if (res.status >= 500) {
            defaultMessage = 'خطای سرور. لطفاً بعداً تلاش کنید';
          }
          const error = await createErrorFromResponse(res, defaultMessage);
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      const result = await res.json();
      console.log('Upload success:', result);
      return result as { id: string; url: string; original_name: string };
    } catch (error) {
      console.error(`Upload error attempt ${attempt}:`, error);
      
      if (attempt === retries) {
        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید');
        }
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('آپلود فایل ناموفق بود. لطفاً دوباره تلاش کنید');
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('آپلود فایل پس از تلاش‌های متعدد ناموفق بود');
}

// Password Reset Functions
export async function passwordResetRequest(email: string) {
  const res = await fetch(getApiUrl('/v1/auth/password-reset-request/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'درخواست بازیابی رمز عبور ناموفق بود');
  }
  return (await res.json()) as { detail: string; reset_url?: string };
}

export async function passwordResetConfirm(token: string, newPassword: string) {
  const res = await fetch(getApiUrl('/v1/auth/password-reset-confirm/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'تایید بازیابی رمز عبور ناموفق بود');
  }
  return (await res.json()) as { detail: string };
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const res = await fetch(getApiUrl('/v1/auth/change-password/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'تغییر رمز عبور ناموفق بود');
  }
  return (await res.json()) as { detail: string };
}

// Phone Verification Status Check
export async function checkPhoneVerificationStatus(): Promise<{ 
  phone: string; 
  is_phone_verified: boolean; 
  verification_required: boolean; 
  message: string; 
}> {
  try {
    return await fetchJson<{ 
      phone: string; 
      is_phone_verified: boolean; 
      verification_required: boolean; 
      message: string; 
    }>('/v1/auth/check-phone-verification/');
  } catch (error) {
    console.error('Error checking phone verification status:', error);
    throw error;
  }
}

// Phone Verification Functions
export async function phoneVerificationRequest(phone: string) {
  const res = await fetch(getApiUrl('/v1/auth/phone-verification-request/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'درخواست تایید شماره تلفن ناموفق بود');
  }
  return (await res.json()) as { detail: string; code?: string; expires_in: number; message_id?: string };
}

export async function phoneVerificationConfirm(phone: string, code: string) {
  const res = await fetch(getApiUrl('/v1/auth/phone-verification-confirm/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify({ phone, code }),
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'تایید شماره تلفن ناموفق بود');
  }
  return (await res.json()) as { detail: string };
}

// SMS Password Reset Functions
export async function passwordResetRequestSMS(email: string) {
  const res = await fetch(getApiUrl('/v1/auth/password-reset-request-sms/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'درخواست بازیابی رمز عبور از طریق پیامک ناموفق بود');
  }
  return (await res.json()) as { detail: string; phone?: string; code?: string; expires_in: number; message_id?: string };
}

export async function passwordResetConfirmSMS(code: string, newPassword: string) {
  const res = await fetch(getApiUrl('/v1/auth/password-reset-confirm-sms/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify({ token: code, new_password: newPassword }),
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'تایید بازیابی رمز عبور از طریق پیامک ناموفق بود');
  }
  return (await res.json()) as { detail: string };
}

// Verify SMS code for password reset (without changing password)
export async function verifyPasswordResetSMS(code: string) {
  const res = await fetch(getApiUrl('/v1/auth/password-reset-confirm-sms/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify({ token: code, verify_only: true }),
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'تایید کد پیامک ناموفق بود');
  }
  return (await res.json()) as { detail: string };
}

// User Phone Verification (for authenticated users)
export async function verifyUserPhone(phone: string) {
  const res = await fetch(getApiUrl('/v1/auth/verify-user-phone/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
      'Authorization': `Bearer ${getAccessToken()}`,
    },
    credentials: 'include',
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'درخواست تایید شماره تلفن کاربر ناموفق بود');
  }
  return (await res.json()) as { detail: string; code?: string; expires_in: number; message_id?: string };
}

// SMS Credit Check (admin only)
export async function getSMSCredit() {
  const res = await fetch(getApiUrl('/v1/sms/credit/'), {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${getAccessToken()}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'بررسی اعتبار پیامک ناموفق بود');
  }
  return (await res.json()) as { credit: number; message: string };
}

// Scopes and Services Functions
export async function getScopes(): Promise<{ id: string; name: string; description?: string }[]> {
  try {
    const response = await fetchJson<{ id: string; name: string; description?: string }[]>('/v1/scopes/');
    // Handle paginated response
    if (response && typeof response === 'object' && 'results' in response) {
      return (response as { results?: { id: string; name: string; description?: string }[] }).results || [];
    }
    // Handle direct array response
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching scopes:', error);
    return [];
  }
}

export async function getServices(scopeId?: string): Promise<{ id: string; name: string; type: string; has_tabs?: boolean }[]> {
  try {
    const url = scopeId ? `/v1/services/?scope=${scopeId}` : '/v1/services/';
    const response = await fetchJson<{ id: string; name: string; type: string; has_tabs?: boolean }[]>(url);
    // Handle paginated response from ServiceViewSet
    if (response && typeof response === 'object' && 'results' in response) {
      return (response as { results?: { id: string; name: string; type: string; has_tabs?: boolean }[] }).results || [];
    }
    // Handle direct array response
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

// Dashboard Data Functions
export async function getUserOrders(): Promise<{ id: string; order_number: string; status: string; created_at: string; total_amount?: number }[]> {
  try {
    const url = getApiUrl('/v1/orders/user/');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
        'X-CSRFToken': getCSRFToken() || '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function getUserCart(): Promise<{ id: string; service_name: string; status: string; created_at: string }[] | null> {
  try {
    return await fetchJson<{ id: string; service_name: string; status: string; created_at: string }[]>('/v1/carts/');
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

export async function getUserCartItems(): Promise<{ id: string; service_name: string; status: string; created_at: string }[]> {
  try {
    return await fetchJson<{ id: string; service_name: string; status: string; created_at: string }[]>('/v1/cart-items/');
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
}


export async function getUserStats(): Promise<{ totalOrders?: number; pendingOrders?: number; completedOrders?: number; cartItems?: number; unreadNotifications?: number }> {
  try {
    // For now, return mock data. In the future, this will be a real endpoint
    return Promise.resolve({
      totalOrders: 12,
      pendingOrders: 3,
      completedOrders: 9,
      cartItems: 5,
      unreadNotifications: 1,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cartItems: 0,
      unreadNotifications: 0,
    };
  }
}

// Order Management Functions
export async function createOrder(data: {
  customer: string;
  status: string;
  notes?: string;
  items: {
    service: string;
    field_values: Record<string, unknown>;
    needs_documentation?: boolean;
  }[];
}) {
  try {
    return await fetchJson<unknown>('/v1/orders/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getOrderById(orderId: string) {
  try {
    return await fetchJson<unknown>(`/v1/orders/${orderId}/`);
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    return await fetchJson<unknown>(`/v1/orders/${orderId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Quote Management Functions
export async function createQuote(data: {
  order_item: string;
  contractor: string;
  price: number;
  documentation_price?: number;
  delivery_days: number;
  documentation_days?: number;
  notes?: string;
}) {
  try {
    return await fetchJson<unknown>('/v1/quotes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    throw error;
  }
}

export async function getQuotesByOrder(orderId: string) {
  try {
    return await fetchJson<unknown[]>(`/v1/quotes/order/${orderId}/`);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
}

export async function acceptQuote(quoteId: string) {
  try {
    return await fetchJson<unknown>(`/v1/quotes/${quoteId}/accept/`, {
      method: 'PATCH',
    });
  } catch (error) {
    console.error('Error accepting quote:', error);
    throw error;
  }
}

export async function rejectQuote(quoteId: string) {
  try {
    return await fetchJson<unknown>(`/v1/quotes/${quoteId}/reject/`, {
      method: 'PATCH',
    });
  } catch (error) {
    console.error('Error rejecting quote:', error);
    throw error;
  }
}

// Cart Management Functions
export async function addToCart(data: {
  cart: string;
  service: string;
  field_values: Record<string, unknown>;
  needs_documentation?: boolean;
}) {
  try {
    return await fetchJson<unknown>('/v1/cart-items/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

export async function addOrderToCart(orderId: string) {
  try {
    return await fetchJson<unknown>('/v1/cart-items/', {
      method: 'POST',
      body: JSON.stringify({ 
        order: orderId,
        service: '', // Will be filled by backend
        field_values: {},
        needs_documentation: false
      }),
    });
  } catch (error) {
    console.error('Error adding order to cart:', error);
    throw error;
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    return await fetchJson<unknown>(`/v1/cart-items/${cartItemId}/`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

// Payment Functions
export async function processPayment(orderId: string, paymentData: {
  amount: number;
  method: string;
  gateway_response?: unknown;
}) {
  try {
    return await fetchJson<unknown>('/v1/payments/process/', {
      method: 'POST',
      body: JSON.stringify({
        order: orderId,
        ...paymentData
      }),
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

export async function downloadInvoice(orderId: string) {
  try {
    const response = await fetch(getApiUrl(`/v1/orders/${orderId}/invoice/`), {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'X-CSRFToken': getCSRFToken() || '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
}

// Notification Functions
export async function getUserNotifications(): Promise<{ id: string; title: string; message: string; createdAt: string; isRead?: boolean }[]> {
  try {
    return await fetchJson<{ id: string; title: string; message: string; createdAt: string; isRead?: boolean }[]>('/v1/notifications/');
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    return await fetchJson<unknown>(`/v1/notifications/${notificationId}/read/`, {
      method: 'PATCH',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function markAllNotificationsRead() {
  try {
    return await fetchJson<unknown>('/v1/notifications/read-all/', {
      method: 'PATCH',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

// Contractor API Functions
export async function getContractorOrders() {
  try {
    return await fetchJson<unknown[]>('/v1/contractor/orders/');
  } catch (error) {
    console.error('Error fetching contractor orders:', error);
    return [];
  }
}

export async function getContractorProposals() {
  try {
    return await fetchJson<unknown[]>('/v1/contractor/proposals/');
  } catch (error) {
    console.error('Error fetching contractor proposals:', error);
    return [];
  }
}

export async function getContractorActiveProjects() {
  try {
    return await fetchJson<unknown[]>('/v1/contractor/active-projects/');
  } catch (error) {
    console.error('Error fetching contractor active projects:', error);
    return [];
  }
}

export async function getContractorStats() {
  try {
    return await fetchJson<unknown>('/v1/contractor/stats/');
  } catch (error) {
    console.error('Error fetching contractor stats:', error);
    return {
      total_proposals: 0,
      accepted_proposals: 0,
      active_projects: 0,
      rating: 0
    };
  }
}

export async function createContractorProposal(proposalData: {
  order_item: string;
  price: number;
  documentation_price: number;
  delivery_days: number;
  documentation_days: number;
  notes?: string;
}) {
  try {
    return await fetchJson<unknown>('/v1/contractor/proposals/create/', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    });
  } catch (error) {
    console.error('Error creating contractor proposal:', error);
    throw error;
  }
}

export async function getContractorWorkshops() {
  try {
    return await fetchJson<unknown[]>('/v1/contractor/workshops/');
  } catch (error) {
    console.error('Error fetching contractor workshops:', error);
    return [];
  }
}

export async function createContractorWorkshop(workshopData: {
  name: string;
  address: string;
  description?: string;
  province: string;
  city: string;
  postal_address: string;
  manager_name: string;
  manager_phone: string;
  capabilities: string[];
  machines: { name: string; precision: string }[];
}) {
  try {
    return await fetchJson<unknown>('/v1/contractor/workshops/create/', {
      method: 'POST',
      body: JSON.stringify(workshopData),
    });
  } catch (error) {
    console.error('Error creating contractor workshop:', error);
    throw error;
  }
}

export async function checkContractorManufacturingService() {
  try {
    return await fetchJson<unknown>('/v1/contractor/check-manufacturing/');
  } catch (error) {
    console.error('Error checking contractor manufacturing service:', error);
    throw error;
  }
}

export async function getPublicWorkshops(workshopClass?: 'A' | 'B' | 'C') {
  try {
    const url = workshopClass 
      ? `/v1/public/workshops/?class=${workshopClass}`
      : '/v1/public/workshops/';
    return await fetchJson<unknown[]>(url);
  } catch (error) {
    console.error('Error fetching public workshops:', error);
    return [];
  }
}

// Admin Workshop Management API
export async function getAllWorkshopsForAdmin() {
  try {
    return await fetchJson<unknown[]>('/v1/admin/workshops/');
  } catch (error) {
    console.error('Error fetching all workshops for admin:', error);
    throw error;
  }
}

export async function approveWorkshop(workshopId: string, data: {
  is_approved: boolean;
  workshop_class?: 'A' | 'B' | 'C';
  rejection_reason?: string;
}) {
  try {
    return await fetchJson<{ message: string; workshop: unknown }>(`/v1/admin/workshops/${workshopId}/approve/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error approving workshop:', error);
    throw error;
  }
}

// Turnstile API Functions
export async function loginWithTurnstile(params: { 
  username: string; 
  password: string; 
  turnstile_token: string;
}) {
  const res = await fetch(getApiUrl('/v1/auth/login/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'ورود ناموفق بود');
  }
  return (await res.json()) as { access: string; refresh: string };
}

export async function registerWithTurnstile(params: { 
  username: string; 
  email: string; 
  phone: string; 
  password: string; 
  turnstile_token: string;
}) {
  const res = await fetch(getApiUrl('/v1/auth/register/'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw await createErrorFromResponse(res, 'ثبت نام ناموفق بود');
  }
  return (await res.json()) as unknown;
}

// Fallback Captcha API Functions
export async function getFallbackCaptchaStatus() {
  try {
    return await fetchJson<{ available: boolean }>('/v1/captcha/fallback/');
  } catch (error) {
    console.error('Error checking fallback captcha status:', error);
    return { available: false };
  }
}

export async function getFallbackCaptchaChallenge() {
  try {
    const response = await fetchJson<{ 
      available: boolean; 
      challenge_id?: string; 
      challenge?: string; 
      type?: string; 
    }>('/v1/captcha/fallback/');
    
    if (!response.available) {
      throw new Error('Fallback captcha is not available');
    }
    
    if (!response.challenge_id || !response.challenge) {
      throw new Error('Invalid challenge data received');
    }
    
    return {
      challenge_id: response.challenge_id,
      challenge: response.challenge
    };
  } catch (error) {
    console.error('Error getting fallback captcha challenge:', error);
    throw error;
  }
}

export async function verifyFallbackCaptcha(challengeId: string, answer: string) {
  try {
    return await fetchJson<{ success: boolean; message?: string; valid?: boolean; error?: string }>('/v1/captcha/fallback/verify/', {
      method: 'POST',
      body: JSON.stringify({ challenge_id: challengeId, answer }),
    });
  } catch (error) {
    console.error('Error verifying fallback captcha:', error);
    throw error;
  }
}

// Ticket Management API Functions
export async function getTickets(params?: { status?: string; priority?: string; search?: string }) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `/v1/tickets/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await fetchJson<{ results: unknown[]; count: number }>(url);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
}

export async function getTicketById(ticketId: string) {
  try {
    return await fetchJson<unknown>(`/v1/tickets/${ticketId}/`);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }
}

export async function getTicketMessages(ticketId: string) {
  try {
    return await fetchJson<{ results: unknown[]; count: number }>(`/v1/tickets/${ticketId}/messages/`);
  } catch (error) {
    console.error('Error fetching ticket messages:', error);
    throw error;
  }
}

export async function createTicket(data: {
  category_id: string;
  subject: string;
  content: string;
  order_id?: string;
  priority?: string;
}) {
  try {
    return await fetchJson<{ ticket_id: string; message: string }>('/v1/tickets/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

export async function createTicketMessage(ticketId: string, data: {
  content: string;
  files?: File[];
}) {
  try {
    const formData = new FormData();
    formData.append('ticket_id', ticketId);
    formData.append('content', data.content);
    
    if (data.files) {
      data.files.forEach(file => {
        formData.append('files', file);
      });
    }

    return await fetchJson<{ message_id: string; message: string }>(`/v1/tickets/${ticketId}/messages/`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.error('Error creating ticket message:', error);
    throw error;
  }
}

export async function getTicketCategories() {
  try {
    const url = getApiUrl('/v1/ticket-categories/');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
        'X-CSRFToken': getCSRFToken() || '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  } catch (error) {
    console.error('Error fetching ticket categories:', error);
    return [];
  }
}

// Support System Functions
export async function createSupportFeedback(data: {
  used_services?: boolean | null;
  satisfaction_rating?: number | null;
  personal_feedback?: string;
}) {
  try {
    const url = getApiUrl('/v1/support/feedback/');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
        'X-CSRFToken': getCSRFToken() || '',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating support feedback:', error);
    throw error;
  }
}

export async function getSupportFeedbacks() {
  try {
    const url = getApiUrl('/v1/support/feedback/my/');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
        'X-CSRFToken': getCSRFToken() || '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  } catch (error) {
    console.error('Error fetching support feedbacks:', error);
    return [];
  }
}

export async function askAISupport(question: string) {
  try {
    const url = getApiUrl('/v1/support/ask/');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
        'X-CSRFToken': getCSRFToken() || '',
      },
      credentials: 'include',
      body: JSON.stringify({ question })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error asking AI support:', error);
    throw error;
  }
}

export async function getTicketFileTypes() {
  try {
    const url = getApiUrl('/v1/ticket-file-types/');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
        'X-CSRFToken': getCSRFToken() || '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  } catch (error) {
    console.error('Error fetching ticket file types:', error);
    return [];
  }
}

export async function updateTicketStatus(ticketId: string, status: string) {
  try {
    return await fetchJson<{ message: string }>(`/v1/tickets/${ticketId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
}

export async function respondToTicket(ticketId: string, content: string) {
  try {
    return await fetchJson<TicketMessage>(`/v1/tickets/${ticketId}/respond/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  } catch (error) {
    console.error('Error responding to ticket:', error);
    throw error;
  }
}

export async function closeTicket(ticketId: string) {
  try {
    return await fetchJson<Ticket>(`/v1/tickets/${ticketId}/close/`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error closing ticket:', error);
    throw error;
  }
}

export async function deleteTicket(ticketId: string) {
  try {
    return await fetchJson<boolean>(`/v1/tickets/${ticketId}/`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
}

export async function getContentFilterLogs(params?: { 
  violation_type?: string; 
  action_taken?: string; 
  user_id?: string;
  page?: number;
}) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.violation_type) queryParams.append('violation_type', params.violation_type);
    if (params?.action_taken) queryParams.append('action_taken', params.action_taken);
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const url = `/v1/content-filter-logs/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await fetchJson<{ results: unknown[]; count: number }>(url);
  } catch (error) {
    console.error('Error fetching content filter logs:', error);
    throw error;
  }
}

export async function reviewContentViolation(violationId: string, isFalsePositive: boolean) {
  try {
    return await fetchJson<{ message: string }>(`/v1/content-filter-logs/${violationId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_false_positive: isFalsePositive }),
    });
  } catch (error) {
    console.error('Error reviewing content violation:', error);
    throw error;
  }
}

// ============================================
// User Profile & Direct Messaging API
// ============================================

export interface UserPublicProfile {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string | null;
  created_at?: string;
  role?: { name: string; display_name: string } | null;
}

export interface DirectMessageType {
  id: string;
  conversation: string;
  sender: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface ConversationType {
  id: string;
  other_user: UserPublicProfile | null;
  last_message: DirectMessageType | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export async function getPublicUsers(search?: string): Promise<UserPublicProfile[]> {
  const url = search
    ? `/v1/users/search/?search=${encodeURIComponent(search)}`
    : '/v1/users/search/';
  return fetchJson<UserPublicProfile[]>(url);
}

export async function getUserPublicProfile(userId: string): Promise<UserPublicProfile> {
  return fetchJson<UserPublicProfile>(`/v1/users/${userId}/profile/`);
}

export async function getConversations(): Promise<ConversationType[]> {
  return fetchJson<ConversationType[]>('/v1/conversations/');
}

export async function getOrCreateConversation(userId: string): Promise<ConversationType> {
  return fetchJson<ConversationType>(`/v1/conversations/with/${userId}/`, {
    method: 'POST',
  });
}

export async function getConversationMessages(conversationId: string): Promise<DirectMessageType[]> {
  return fetchJson<DirectMessageType[]>(`/v1/conversations/${conversationId}/messages/`);
}

export async function sendDirectMessage(conversationId: string, content: string): Promise<DirectMessageType> {
  return fetchJson<DirectMessageType>(`/v1/conversations/${conversationId}/send/`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function markMessagesRead(conversationId: string): Promise<void> {
  return fetchJson(`/v1/conversations/${conversationId}/read/`, {
    method: 'PATCH',
  });
}

// Missing functions that are referenced in api object
export async function changePasswordRequest(data: { old_password: string; new_password: string }) {
  try {
    return await fetchJson<unknown>('/v1/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

// ============================================
// Workforce Management API
// ============================================

// Job Seeker API
export async function createJobSeekerProfile(data: {
  job_title: string;
  experience_years: number;
  education: string;
  cv_text: string;
  service_scope?: string;
  services?: string[];
  skills?: string[];
}) {
  try {
    return await fetchJson<{ id: string; message: string }>('/v1/job-seekers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error creating job seeker profile:', error);
    throw error;
  }
}

export async function getJobSeekerProfile(profileId?: string) {
  try {
    const url = profileId ? `/v1/job-seekers/${profileId}/` : '/v1/job-seekers/';
    return await fetchJson(url);
  } catch (error) {
    console.error('Error fetching job seeker profile:', error);
    throw error;
  }
}

export async function updateJobSeekerProfile(profileId: string, data: Record<string, unknown>) {
  try {
    return await fetchJson(`/v1/job-seekers/${profileId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error updating job seeker profile:', error);
    throw error;
  }
}

export async function deleteJobSeekerProfile(profileId: string) {
  try {
    return await fetchJson(`/v1/job-seekers/${profileId}/`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting job seeker profile:', error);
    throw error;
  }
}

export async function getPublicJobSeekers(params?: { service_scope?: string }) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.service_scope) {
      queryParams.append('service_scope', params.service_scope);
    }
    const queryString = queryParams.toString();
    const url = queryString ? `/v1/public/job-seekers/?${queryString}` : '/v1/public/job-seekers/';
    return await fetchJson<Array<{ id: string; job_title: string; experience_years: number; education?: string; cv_text?: string; service_scope?: { id: string; name: string; display_name?: string }; services?: Array<{ id: string; name: string }>; skills?: string[]; is_active?: boolean; is_available?: boolean; created_at?: string }>>(url);
  } catch (error) {
    console.error('Error fetching public job seekers:', error);
    throw error;
  }
}

export async function createJobSeekerHireRequest(data: {
  job_seeker: string;
  message?: string;
}) {
  try {
    return await fetchJson<{ id: string; job_seeker: { id: string; job_title: string }; message?: string; status: string; created_at: string }>('/v1/job-seekers/hire-request/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error creating job seeker hire request:', error);
    throw error;
  }
}

// Work Request API
export async function createWorkRequest(data: {
  workshop?: string;
  requested_job_title: string;
  required_skills?: string[];
  service_scope?: string;
  required_services?: string[];
  min_experience?: number;
  preferred_education?: string;
  offered_salary?: number;
  work_hours?: string;
  work_location: string;
  work_type?: string;
  description: string;
  requirements?: string;
}) {
  try {
    return await fetchJson<{ id: string; message: string }>('/v1/work-requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error creating work request:', error);
    throw error;
  }
}

export async function getWorkRequests(requestId?: string) {
  try {
    const url = requestId ? `/v1/work-requests/${requestId}/` : '/v1/work-requests/';
    return await fetchJson(url);
  } catch (error) {
    console.error('Error fetching work requests:', error);
    throw error;
  }
}

export async function updateWorkRequestStatus(requestId: string, data: Record<string, unknown>) {
  try {
    return await fetchJson(`/v1/work-requests/${requestId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error updating work request:', error);
    throw error;
  }
}

// Job Match API
export async function getJobMatches(matchId?: string) {
  try {
    const url = matchId ? `/v1/job-matches/${matchId}/` : '/v1/job-matches/';
    return await fetchJson(url);
  } catch (error) {
    console.error('Error fetching job matches:', error);
    throw error;
  }
}

export async function createJobMatch(data: {
  work_request: string;
  job_seeker: string;
  match_score: number;
  match_reason?: string;
}) {
  try {
    return await fetchJson<{ id: string; message: string }>('/v1/job-matches/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error creating job match:', error);
    throw error;
  }
}

export async function updateJobMatchStatus(matchId: string, data: Record<string, unknown>) {
  try {
    return await fetchJson(`/v1/job-matches/${matchId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error updating job match:', error);
    throw error;
  }
}

// Work Contract API
export async function getWorkContracts(contractId?: string) {
  try {
    const url = contractId ? `/v1/work-contracts/${contractId}/` : '/v1/work-contracts/';
    return await fetchJson(url);
  } catch (error) {
    console.error('Error fetching work contracts:', error);
    throw error;
  }
}

export async function createWorkContract(data: {
  job_match: string;
  start_date: string;
  end_date?: string;
  salary_amount: number;
  salary_frequency: string;
  work_hours: string;
  work_location: string;
  responsibilities: string;
}) {
  try {
    return await fetchJson<{ id: string; message: string }>('/v1/work-contracts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error creating work contract:', error);
    throw error;
  }
}

export async function signContract(contractId: string, signatureType: 'contractor' | 'seeker') {
  try {
    return await fetchJson(`/v1/work-contracts/${contractId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        [signatureType === 'contractor' ? 'contractor_signed' : 'seeker_signed']: true 
      }),
    });
  } catch (error) {
    console.error('Error signing contract:', error);
    throw error;
  }
}

// Specialist Profile API
export async function createSpecialistProfile(data: {
  province: string;
  city: string;
  address: string;
  birth_date: string;
  national_id: string;
  education: string;
  field_of_study: string;
  specializations?: string[];
  specialization_services?: string[];
  skills?: Array<{ name: string; level: string }>;
  work_experience?: Array<{ company: string; position: string; start_date: string; end_date?: string | null; description: string }>;
  resume_file?: string;
  description?: string;
}) {
  try {
    return await fetchJson<{ id: string; message: string }>('/v1/specialist-profiles/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error creating specialist profile:', error);
    throw error;
  }
}

export async function getSpecialistProfile(profileId?: string) {
  try {
    const url = profileId ? `/v1/specialist-profiles/${profileId}/` : '/v1/specialist-profiles/';
    return await fetchJson(url);
  } catch (error) {
    console.error('Error fetching specialist profile:', error);
    throw error;
  }
}

export async function updateSpecialistProfile(profileId: string, data: Record<string, unknown>) {
  try {
    return await fetchJson(`/v1/specialist-profiles/${profileId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error updating specialist profile:', error);
    throw error;
  }
}

export async function getPublicSpecialists(params?: { province?: string; city?: string }) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.province) queryParams.append('province', params.province);
    if (params?.city) queryParams.append('city', params.city);
    const url = `/v1/public/specialists/?${queryParams.toString()}`;
    return await fetchJson(url);
  } catch (error) {
    console.error('Error fetching public specialists:', error);
    throw error;
  }
}

// Specialist Hire Request API
export async function createSpecialistHireRequest(data: {
  specialist_profile: string;
  message?: string;
}) {
  try {
    return await fetchJson<{ id: string; message: string }>('/v1/specialist-hire-requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error creating specialist hire request:', error);
    throw error;
  }
}

export async function getSpecialistHireRequests(requestId?: string) {
  try {
    const url = requestId ? `/v1/specialist-hire-requests/${requestId}/` : '/v1/specialist-hire-requests/';
    return await fetchJson(url);
  } catch (error) {
    console.error('Error fetching specialist hire requests:', error);
    throw error;
  }
}

// Admin Specialist Management API
export async function approveSpecialistProfile(specialistId: string, data: {
  is_approved: boolean;
  admin_notes?: string;
}) {
  try {
    return await fetchJson(`/v1/admin/specialists/${specialistId}/approve/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error approving specialist profile:', error);
    throw error;
  }
}

export async function getAllSpecialistsForAdmin() {
  try {
    return await fetchJson('/v1/specialist-profiles/');
  } catch (error) {
    console.error('Error fetching all specialists for admin:', error);
    throw error;
  }
}


// API object for easy access to all functions
export const api = {
  // Auth
  me: meRequest,
  login: loginRequest,
  refreshToken: refreshAccessToken,
  changePassword: changePasswordRequest,
  passwordResetRequest: passwordResetRequest,
  passwordResetConfirm: passwordResetConfirm,
  passwordResetConfirmSMS: passwordResetConfirmSMS,
  verifyPasswordResetSMS: verifyPasswordResetSMS,
  phoneVerificationRequest: phoneVerificationRequest,
  phoneVerificationConfirm: phoneVerificationConfirm,
  
  // Services
  getAllServices,
  getServiceFields,
  getScopes,
  getServices,
  
  // Orders
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  
  // Cart
  getUserCart,
  getUserCartItems,
  createCart,
  addToCart,
  addOrderToCart,
  removeFromCart,
  
  // Quotes
  createQuote,
  getQuotesByOrder,
  acceptQuote,
  rejectQuote,
  
  // Payments
  processPayment,
  downloadInvoice,
  
  // Notifications
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  
  // Contractor
  getContractorOrders,
  getContractorProposals,
  getContractorActiveProjects,
  getContractorStats,
  createContractorProposal,
  getContractorWorkshops,
  createContractorWorkshop,
  checkContractorManufacturingService,
  getPublicWorkshops,
  
  // Turnstile
  getFallbackCaptchaStatus,
  getFallbackCaptchaChallenge,
  verifyFallbackCaptcha,
  loginWithTurnstile,
  registerWithTurnstile,
  
  // Tickets
  getTickets,
  getTicketById,
  getTicketMessages,
  createTicket,
  createTicketMessage,
  getTicketCategories,
  getTicketFileTypes,
  
  // Support
  createSupportFeedback,
  getSupportFeedbacks,
  askAISupport,
  updateTicketStatus,
  respondToTicket,
  closeTicket,
  deleteTicket,
  getContentFilterLogs,
  reviewContentViolation,
  
  // Workforce Management
  createJobSeekerProfile,
  getJobSeekerProfile,
  updateJobSeekerProfile,
  createWorkRequest,
  getWorkRequests,
  updateWorkRequestStatus,
  getJobMatches,
  createJobMatch,
  updateJobMatchStatus,
  getWorkContracts,
  createWorkContract,
  signContract,
  
  // Specialist Management
  createSpecialistProfile,
  getSpecialistProfile,
  updateSpecialistProfile,
  getPublicSpecialists,
  createSpecialistHireRequest,
  getSpecialistHireRequests,
  approveSpecialistProfile,
  getAllSpecialistsForAdmin,
  
  // User profile & messaging
  getPublicUsers,
  getUserPublicProfile,
  getConversations,
  getOrCreateConversation,
  getConversationMessages,
  sendDirectMessage,
  markMessagesRead,
  
  // Utility functions
  getAccessToken,
  setTokens,
  clearTokens,
  getRefreshToken,
  fetchJson,
};

// Re-export csrf helper for consumers that need it (e.g., authenticated downloads in admin pages)
export { getCSRFToken } from './csrfProtection';