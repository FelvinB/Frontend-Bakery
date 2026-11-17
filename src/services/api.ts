export type ApiList<T> = T[];

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export const endpoints = {
  customers: '/customers',
  products: '/products',
  sales: '/sales',
  inventory: '/inventory',
  marketing: '/marketing',
  analytics: {
    dashboard: '/analytics/dashboard',
    descriptive: '/analytics/descriptive',
    predictive: '/analytics/predictive',
    prescriptive: '/analytics/prescriptive',
  },
};
