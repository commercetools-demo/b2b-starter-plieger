'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/context/LocaleContext';
import { formatMoney, formatDate } from '@/lib/utils';

function ConfirmationContent() {
  const { localePath } = useLocale();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="text-5xl mb-4">&#10003;</div>
      <h1 className="text-3xl font-bold mb-2">Order Confirmed</h1>
      <p className="text-gray-600 mb-8">
        Thank you for your order. We&apos;ve received your purchase and will begin processing it shortly.
      </p>

      {order && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-left mb-8">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Order Number</dt>
              <dd className="font-semibold">{order.orderNumber ?? order.id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Date</dt>
              <dd className="font-semibold">{formatDate(order.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Items</dt>
              <dd className="font-semibold">{order.lineItems?.length ?? 0}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Total</dt>
              <dd className="font-semibold">{formatMoney(order.taxedPrice?.totalGross ?? order.totalPrice)}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <Button variant="primary" href={localePath('/dashboard/orders')}>View Orders</Button>
        <Button variant="secondary" href={localePath('/products')}>Continue Shopping</Button>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
