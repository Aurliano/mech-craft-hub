export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
export const API_ROOT = `${API_BASE_URL}/api`;

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

export async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export async function loginRequest(params: { username: string; password: string }) {
  const res = await fetch(`${API_ROOT}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return (await res.json()) as { access: string; refresh: string };
}

export async function registerRequest(params: { username: string; email: string; phone: string; password: string }) {
  return fetchJson('/v1/auth/register/', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function meRequest() {
  return fetchJson('/v1/auth/me/', { method: 'GET' });
}

export async function getServices() {
  return fetchJson<any[]>('/v1/services/');
}

export async function createCart(customer: string) {
  return fetchJson<any>('/v1/carts/', {
    method: 'POST',
    body: JSON.stringify({ customer }),
  });
}

export async function createCartItem(data: {
  cart: string;
  service: string;
  field_values: Record<string, any>;
  needs_documentation?: boolean;
}) {
  return fetchJson<any>('/v1/cart-items/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function uploadFile(file: File, extra?: { context?: string; context_id?: string }) {
  const token = getAccessToken();
  const form = new FormData();
  form.append('file', file);
  if (extra?.context) form.append('context', extra.context);
  if (extra?.context_id) form.append('context_id', extra.context_id);
  const res = await fetch(`${API_ROOT}/v1/upload/`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Upload failed');
  }
  return (await res.json()) as { id: string; url: string; original_name: string };
} 