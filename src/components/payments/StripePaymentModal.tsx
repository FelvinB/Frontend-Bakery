import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { statusMessages, stripePaymentApi, type PaymentStatus, type StripePaymentMethod } from '@/services/payments/stripe';

type Props = {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
  description: string;
  amount: number;
  currency?: 'PHP';
  onStatusChange?: (status: PaymentStatus, transaction?: any) => void;
};

declare global { interface Window { Stripe?: any } }

function loadStripeJs(): Promise<void> {
  if (window.Stripe) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Stripe.js')));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Stripe.js'));
    document.body.appendChild(s);
  });
}

export default function StripePaymentModal({ open, onClose, orderNumber, description, amount, currency = 'PHP', onStatusChange }: Props) {
  const [selected, setSelected] = useState<StripePaymentMethod>('gcash');
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const cardElementRef = useRef<any>(null);

  const cardSelected = selected === 'credit_card' || selected === 'debit_card';
  const canSubmit = useMemo(() => !loading && amount > 0 && !!orderNumber, [loading, amount, orderNumber]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadStripeJs().then(() => {
      if (cancelled) return;
      const pk = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!pk || !window.Stripe) throw new Error('Missing VITE_STRIPE_PUBLISHABLE_KEY');
      stripeRef.current = stripeRef.current || window.Stripe(pk);
      elementsRef.current = elementsRef.current || stripeRef.current.elements();
      setStripeReady(true);
    }).catch((e) => setError(e.message || 'Failed to initialize Stripe'));
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open || !stripeReady || !cardSelected || !cardRef.current || !elementsRef.current) return;
    if (!cardElementRef.current) {
      cardElementRef.current = elementsRef.current.create('card', { hidePostalCode: true });
      cardElementRef.current.mount(cardRef.current);
    }
    return () => {
      // keep element mounted while modal open for smoother toggling
    };
  }, [open, stripeReady, cardSelected]);

  useEffect(() => {
    if (!open && cardElementRef.current) {
      cardElementRef.current.unmount();
      cardElementRef.current = null;
    }
  }, [open]);

  if (!open) return null;

  const setAndEmit = (s: PaymentStatus, tx?: any) => { setStatus(s); setMessage(statusMessages[s]); onStatusChange?.(s, tx); };

  const createPaymentMethodIfNeeded = async () => {
    if (selected === 'gcash') return {};
    if (!stripeRef.current || !cardElementRef.current) throw new Error('Stripe card form is not ready.');
    const { error: pmError, paymentMethod } = await stripeRef.current.createPaymentMethod({
      type: 'card',
      card: cardElementRef.current,
      billing_details: { name: 'Tita\'s Bakery Customer' },
    });
    if (pmError) throw pmError;
    return { payment_method_id: paymentMethod.id };
  };

  const payNow = async () => {
    if (!canSubmit) return;
    setLoading(true); setError(''); setStatus('processing'); setMessage(statusMessages.processing);
    try {
      const pm = await createPaymentMethodIfNeeded();
      const res = await stripePaymentApi.create({
        order_number: orderNumber,
        description,
        amount,
        currency,
        payment_method: selected,
        ...pm,
        success_redirect_url: window.location.origin + '/payment/success',
        failed_redirect_url: window.location.origin + '/payment/failed',
      });
      const tx = res.transaction;
      const redirectUrl = res.checkout_url || res.action_url;
      if (redirectUrl) {
        setAndEmit((tx?.status as PaymentStatus) || 'pending', tx);
        window.location.href = redirectUrl;
        return;
      }
      if (res.client_secret && res.requires_action && stripeRef.current) {
        const { error: actionErr, paymentIntent } = await stripeRef.current.handleNextAction({ clientSecret: res.client_secret });
        if (actionErr) throw actionErr;
        const s = paymentIntent?.status === 'succeeded' ? 'successful' : 'processing';
        setAndEmit(s, tx);
        return;
      }
      setAndEmit((tx?.status as PaymentStatus) || 'pending', tx);
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || e?.raw?.message || 'Unable to process payment. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setAndEmit('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-stone-100 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-stone-900">Complete Your Payment</h3>
            <p className="text-sm text-stone-500">Select your preferred payment method.</p>
          </div>
          <button onClick={onClose} disabled={loading} className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50" aria-label="Close">✕</button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-stone-700">Payment Methods</p>
            <button type="button" onClick={() => setSelected('gcash')} className={cn('w-full rounded-2xl border p-4 text-left transition', selected === 'gcash' ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' : 'border-stone-200 bg-white hover:border-amber-300')}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-blue-600 text-sm font-extrabold text-white">GCash</div>
                <div>
                  <p className="font-semibold text-stone-800">GCash</p>
                  <p className="text-sm text-stone-500">Pay securely using your GCash account.</p>
                </div>
              </div>
            </button>

            <div className={cn('space-y-3 rounded-2xl border p-1', cardSelected ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-200' : 'border-transparent')}>
              <button type="button" onClick={() => setSelected('credit_card')} className={cn('w-full rounded-2xl border p-4 text-left transition', cardSelected ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-white hover:border-amber-300')}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-stone-900 text-[10px] font-bold tracking-wide text-white">VISA</div>
                  <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-[10px] font-bold text-white">MC</div>
                  <div>
                    <p className="font-semibold text-stone-800">Credit or Debit Card</p>
                    <p className="text-sm text-stone-500">Pay using your Visa or Mastercard.</p>
                  </div>
                </div>
              </button>
              {cardSelected && (
                <div className="space-y-3 rounded-xl bg-white p-4">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSelected('credit_card')} className={cn('rounded-full px-3 py-1 text-xs font-semibold', selected === 'credit_card' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600')}>Credit Card</button>
                    <button type="button" onClick={() => setSelected('debit_card')} className={cn('rounded-full px-3 py-1 text-xs font-semibold', selected === 'debit_card' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600')}>Debit Card</button>
                  </div>
                  <p className="text-xs text-stone-500">Secure card checkout via Stripe.js Elements. Raw card details are never sent to or stored by the app server.</p>
                  <div className="rounded-xl border border-stone-200 px-3 py-3">
                    <div ref={cardRef} />
                  </div>
                  {!stripeReady && <p className="text-xs text-stone-400">Loading secure card form...</p>}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm font-semibold text-stone-700">Payment Summary</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-stone-500">Order Number</dt><dd className="font-medium text-stone-800">{orderNumber}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-stone-500">Description</dt><dd className="text-right font-medium text-stone-800">{description}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-stone-500">Currency</dt><dd className="font-medium text-stone-800">{currency}</dd></div>
                <div className="flex justify-between gap-4 border-t border-stone-200 pt-2 text-base"><dt className="font-semibold text-stone-700">Total Amount</dt><dd className="font-bold text-amber-700">₱{Number(amount).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}</dd></div>
              </dl>
            </div>

            {status && (
              <div className={cn('rounded-xl border p-3 text-sm', status === 'successful' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : status === 'failed' || status === 'expired' || status === 'cancelled' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-900')}>
                <p className="font-semibold capitalize">{status}</p>
                <p>{message}</p>
              </div>
            )}
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

            <button onClick={payNow} disabled={!canSubmit} className={cn('flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition', canSubmit ? 'bg-amber-500 hover:bg-amber-600' : 'cursor-not-allowed bg-stone-300')}>
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />}
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
            <p className="text-center text-xs text-stone-400">Payments are created and verified securely through the backend (Laravel + Stripe). No secret keys or raw card data are exposed in the browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
