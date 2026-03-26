'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import { formatMoney, localizedString } from '@/lib/utils';

function CheckoutQuoteContent() {
  const router = useRouter();
  const { localePath } = useLocale();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId') ?? '';
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();

  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.push(localePath('/login')); return; }
    if (!quoteId) { setLoading(false); return; }

    fetch(`/api/quotes/${quoteId}`)
      .then((r) => r.json())
      .then((data) => setQuote(data.quote ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [quoteId, isLoggedIn, router]);

  const handleAcceptAndOrder = async () => {
    if (!quote) return;
    setAccepting(true);
    try {
      // Step 1: Accept the quote
      const acceptRes = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', version: quote.version }),
      });
      const acceptData = await acceptRes.json();
      if (!acceptRes.ok) throw new Error(acceptData.error);

      const acceptedQuote = acceptData.quote;

      // Step 2: Create order from the accepted quote
      const orderRes = await fetch(`/api/quotes/${quoteId}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: acceptedQuote.version }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      addToast('Order placed successfully!');
      router.push(localePath(`/checkout/confirmation?orderId=${orderData.order?.id ?? ''}`));
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to place order');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!quoteId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h1 className="text-xl font-bold mb-4">No quote specified</h1>
        <Button variant="primary" href={localePath('/dashboard/quotes')}>Back to Quotes</Button>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h1 className="text-xl font-bold mb-4">Quote not found</h1>
        <Button variant="primary" href={localePath('/dashboard/quotes')}>Back to Quotes</Button>
      </div>
    );
  }

  const canAccept = quote.quoteState === 'Pending' || quote.quoteState === 'RenegotiationAddressed';

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" href={localePath('/dashboard/quotes')} size="sm">← Back to Quotes</Button>
        <h1 className="text-2xl font-bold">Accept Quote</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-slate-500">Quote ID</p>
            <p className="font-mono text-sm">{quote.id}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            quote.quoteState === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
            quote.quoteState === 'Accepted' ? 'bg-green-100 text-green-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {quote.quoteState}
          </span>
        </div>

        {quote.sellerComment && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 mb-4">
            <p className="text-xs font-semibold text-blue-700 mb-1">Seller Note</p>
            <p className="text-sm text-blue-800">{quote.sellerComment}</p>
          </div>
        )}

        {quote.validTo && (
          <p className="text-sm text-slate-500 mb-4">
            Valid until: {new Date(quote.validTo).toLocaleDateString()}
          </p>
        )}

        <h3 className="text-sm font-semibold text-slate-700 mb-3">Line Items</h3>
        <div className="space-y-2 mb-4">
          {(quote.lineItems ?? []).map((item: any) => (
            <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="font-medium text-slate-900">{localizedString(item.name)}</p>
                <p className="text-xs text-slate-500">SKU: {item.variant?.sku} · Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">{formatMoney(item.totalPrice)}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-200">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold text-slate-900">{formatMoney(quote.totalPrice)}</span>
        </div>
      </div>

      {canAccept ? (
        <Button
          variant="primary"
          size="lg"
          loading={accepting}
          onClick={handleAcceptAndOrder}
          className="w-full"
        >
          Accept &amp; Place Order
        </Button>
      ) : (
        <p className="text-center text-sm text-slate-500">
          This quote cannot be accepted in its current state ({quote.quoteState}).
        </p>
      )}
    </div>
  );
}

export default function CheckoutQuotePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-10 text-sm text-gray-500">Loading…</div>}>
      <CheckoutQuoteContent />
    </Suspense>
  );
}
