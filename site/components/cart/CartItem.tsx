'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRecurrencePolicies } from '@/hooks/useRecurrencePolicies';
import { formatMoney, localizedString } from '@/lib/utils';
import type { LineItem } from '@/lib/types';

export interface CartItemProps {
  item: LineItem;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, loading } = useCart();
  const { data: policies = [] } = useRecurrencePolicies();
  const [qty, setQty] = useState(item.quantity);

  const recurringPolicy = item.recurrenceInfo
    ? policies.find((p) => p.id === item.recurrenceInfo!.recurrencePolicy.id)
    : null;

  const image = item.variant.images?.[0];
  const name = localizedString(item.name);
  const sku = item.variant.sku;

  const handleUpdateQuantity = (newQty: number) => {
    if (newQty < 1) return;
    setQty(newQty);
    updateQuantity(item.id, newQty);
  };

  return (
    <div className="flex gap-4 py-4">
      {/* Image */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        {image ? (
          <img
            src={image.url}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            No img
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-slate-900">{name}</h4>
          {sku && (
            <p className="mt-0.5 text-xs text-slate-500">SKU: {sku}</p>
          )}
          {recurringPolicy && (
            <span className="mt-1 inline-block text-xs text-blue-600 bg-blue-50 rounded px-1.5 py-0.5">
              ↻ {recurringPolicy.name}
            </span>
          )}
          <p className="mt-1 text-sm text-slate-600">
            {formatMoney(item.price.value)} each
          </p>
        </div>

        {/* Quantity + price */}
        <div className="mt-2 flex items-center gap-4 sm:mt-0">
          <div className="flex items-center rounded-md border border-slate-300">
            <button
              onClick={() => handleUpdateQuantity(qty - 1)}
              disabled={qty <= 1 || loading}
              className="px-2 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1) handleUpdateQuantity(val);
              }}
              className="w-12 border-x border-slate-300 py-1 text-center text-sm text-slate-900 focus:outline-none"
            />
            <button
              onClick={() => handleUpdateQuantity(qty + 1)}
              disabled={loading}
              className="px-2 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <p className="w-24 text-right text-sm font-semibold text-slate-900">
            {formatMoney(item.totalPrice)}
          </p>

          <button
            onClick={() => removeItem(item.id)}
            disabled={loading}
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            aria-label="Remove item"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
