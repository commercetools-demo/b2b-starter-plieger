'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { QuoteStatus } from '@/components/quotes/QuoteStatus';
import { formatMoney, formatDateTime, localizedString } from '@/lib/utils';

export default function QuoteRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const [quoteRequest, setQuoteRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/quote-requests/${id}`)
      .then((r) => r.json())
      .then((data) => setQuoteRequest(data.quoteRequest ?? data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!quoteRequest) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/quote-requests/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: quoteRequest.version }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQuoteRequest(data.quoteRequest ?? data);
      addToast('Quote request cancelled');
    } catch {
      addToast('Failed to cancel quote request');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!quoteRequest) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-2">Quote Request Not Found</h1>
        <Button variant="primary" href="/dashboard/quotes">Back to Quotes</Button>
      </div>
    );
  }

  const lineItemColumns = [
    {
      key: 'name',
      header: 'Product',
      render: (item: any) => localizedString(item.name),
    },
    { key: 'quantity', header: 'Qty', render: (item: any) => item.quantity },
    { key: 'price', header: 'Unit Price', render: (item: any) => formatMoney(item.price?.value) },
    { key: 'total', header: 'Total', render: (item: any) => formatMoney(item.totalPrice) },
  ];

  const state = quoteRequest.quoteRequestState;
  const canCancel = state === 'Submitted';

  return (
    <div>
      <Button variant="ghost" size="sm" href="/dashboard/quotes" className="mb-4">&larr; Back to Quotes</Button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quote Request {quoteRequest.id.slice(0, 8)}</h1>
          <p className="text-gray-500 text-sm mt-1">{formatDateTime(quoteRequest.createdAt)}</p>
        </div>
        <QuoteStatus state={state} />
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Line Items</h2>
        <Table columns={lineItemColumns} data={quoteRequest.lineItems ?? []} loading={false} emptyMessage="No items" />
        <div className="mt-4 flex justify-end">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold">{formatMoney(quoteRequest.totalPrice)}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quoteRequest.comment && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Notes</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{quoteRequest.comment}</p>
        </div>
      )}

      {/* PO Number */}
      {quoteRequest.purchaseOrderNumber && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Purchase Order</h2>
          <p className="text-sm">{quoteRequest.purchaseOrderNumber}</p>
        </div>
      )}

      {/* Actions */}
      {canCancel && (
        <div className="flex gap-3">
          <Button variant="danger" loading={cancelLoading} onClick={handleCancel}>
            Cancel Request
          </Button>
        </div>
      )}
    </div>
  );
}
