const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export type StripePaymentMethod = 'gcash' | 'credit_card' | 'debit_card';
export type PaymentStatus = 'pending' | 'processing' | 'successful' | 'failed' | 'expired' | 'cancelled';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

export const stripePaymentApi = {
  create: (payload: Record<string, unknown>) => request<any>('/payments/stripe', { method: 'POST', body: JSON.stringify(payload) }),
  get: (reference: string) => request<any>(`/payments/stripe/${reference}`),
};

export const statusMessages: Record<PaymentStatus, string> = {
  pending: 'Your payment is pending. Please complete the payment to continue.',
  processing: 'Your payment is being processed. This may take a moment.',
  successful: 'Payment successful! Thank you for your payment.',
  failed: 'Payment failed. Please check your details and try again.',
  expired: 'Payment expired. Please create a new payment and try again.',
  cancelled: 'Payment was cancelled.',
};
