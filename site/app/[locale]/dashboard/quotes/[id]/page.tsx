'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { useQuote, useQuoteMutations } from '@/hooks/useQuotes';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { QuoteStatus } from '@/components/quotes/QuoteStatus';
import { formatMoney, formatDateTime, localizedString } from '@/lib/utils';

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { localePath } = useLocale();
  const { addToast } = useToast();
  const { data: quote, isLoading } = useQuote(id);
  const { performQuoteAction } = useQuoteMutations();

  const [actionLoading, setActionLoading] = useState(false);
  const [renegotiateOpen, setRenegotiateOpen] = useState(false);
  const [comment, setComment] = useState('');

  const handleAction = async (action: string, extra?: Record<string, any>) => {
    if (!quote) return;
    setActionLoading(true);
    try {
      await performQuoteAction(id, action, quote.version, extra);
      addToast(`Quote ${action}ed successfully`);
    } catch {
      addToast(`Failed to ${action} quote`);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-2">Quote Not Found</h1>
        <Button variant="primary" href={localePath('/dashboard/quotes')}>Back to Quotes</Button>
      </div>
    );
  }

  const originalTotal = quote.stagedCart?.obj?.totalPrice ?? null;
  const quotedTotal = quote.totalPrice;
  const hasDiscount =
    originalTotal &&
    quotedTotal &&
    originalTotal.currencyCode === quotedTotal.currencyCode &&
    originalTotal.centAmount > quotedTotal.centAmount;
  const discountAmount = hasDiscount
    ? {
        centAmount: originalTotal.centAmount - quotedTotal.centAmount,
        currencyCode: quotedTotal.currencyCode,
        fractionDigits: quotedTotal.fractionDigits ?? 2,
      }
    : null;
  const discountPercent = hasDiscount
    ? Math.round(((originalTotal.centAmount - quotedTotal.centAmount) / originalTotal.centAmount) * 100)
    : 0;

  const lineItemColumns = [
    {
      key: 'name',
      header: 'Product',
      render: (item: any) => localizedString(item.name),
    },
    { key: 'quantity', header: 'Qty', render: (item: any) => item.quantity },
    {
      key: 'price',
      header: 'Unit Price',
      render: (item: any) => {
        const original = item.price?.value;
        const discounted = item.price?.discounted?.value ?? item.discountedPrice?.value;
        if (discounted && original && discounted.centAmount < original.centAmount) {
          return (
            <div>
              <span className="line-through text-gray-400 text-xs mr-1">{formatMoney(original)}</span>
              <span className="text-green-700 font-medium">{formatMoney(discounted)}</span>
            </div>
          );
        }
        return formatMoney(original);
      },
    },
    { key: 'total', header: 'Total', render: (item: any) => formatMoney(item.totalPrice) },
  ];

  const state = quote.quoteState;
  const canAccept = state === 'Pending' || state === 'WaitingForBuyerAcceptance';
  const canDecline = state === 'Pending' || state === 'WaitingForBuyerAcceptance';
  const canRenegotiate = state === 'Pending' || state === 'WaitingForBuyerAcceptance';

  return (
    <div>
      <Button variant="ghost" size="sm" href={localePath('/dashboard/quotes')} className="mb-4">&larr; Back to Quotes</Button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quote {quote.id.slice(0, 8)}</h1>
          <p className="text-gray-500 text-sm mt-1">{formatDateTime(quote.createdAt)}</p>
        </div>
        <QuoteStatus state={state} />
      </div>

      {hasDiscount && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-green-700 text-lg font-bold">{discountPercent}% off</span>
            <span className="text-green-700 text-sm">
              You save {formatMoney(discountAmount!)} on this quote
            </span>
          </div>
          <div className="text-right text-sm text-green-600">
            <span className="line-through text-gray-400 mr-2">{formatMoney(originalTotal)}</span>
            <span className="font-bold text-green-700">{formatMoney(quotedTotal)}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Line Items</h2>
        <Table columns={lineItemColumns} data={quote.lineItems ?? []} loading={false} emptyMessage="No items" />
        <div className="mt-4 flex justify-end">
          <div className="text-right">
            {hasDiscount && (
              <p className="text-sm text-gray-400 line-through">{formatMoney(originalTotal)}</p>
            )}
            <p className="text-sm text-gray-500">Quoted Total</p>
            <p className="text-xl font-bold">{formatMoney(quote.totalPrice)}</p>
          </div>
        </div>
      </div>

      {(quote.buyerComment || quote.sellerComment) && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Comments</h2>
          <div className="space-y-4">
            {quote.buyerComment && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Buyer</p>
                <p className="mt-1 text-sm">{quote.buyerComment}</p>
              </div>
            )}
            {quote.sellerComment && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Seller</p>
                <p className="mt-1 text-sm">{quote.sellerComment}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {quote.purchaseOrderNumber && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Purchase Order</h2>
          <p className="text-sm">{quote.purchaseOrderNumber}</p>
        </div>
      )}

      <div className="flex gap-3">
        {canAccept && (
          <Button variant="primary" loading={actionLoading} onClick={() => handleAction('accept')}>
            Accept Quote
          </Button>
        )}
        {canRenegotiate && (
          <Button variant="secondary" onClick={() => setRenegotiateOpen(true)}>
            Request Renegotiation
          </Button>
        )}
        {canDecline && (
          <Button variant="danger" loading={actionLoading} onClick={() => handleAction('decline')}>
            Decline Quote
          </Button>
        )}
      </div>

      <Modal
        isOpen={renegotiateOpen}
        onClose={() => setRenegotiateOpen(false)}
        title="Request Renegotiation"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenegotiateOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={actionLoading}
              onClick={async () => {
                await handleAction('renegotiate', { buyerComment: comment });
                setRenegotiateOpen(false);
                setComment('');
              }}
            >
              Submit
            </Button>
          </>
        }
      >
        <Input
          label="Comment"
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Explain what you'd like to renegotiate..."
        />
      </Modal>
    </div>
  );
}
