'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { formatMoney } from '@/lib/utils';
import type { RecurrencePolicy } from '@/lib/types';

interface Price {
  id: string;
  value: { centAmount: number; currencyCode: string; fractionDigits?: number };
  recurrencePolicy?: { id: string; typeId: 'recurrence-policy' };
}

export interface SubscribeAndSaveBoxProps {
  productId: string;
  variantId: number;
  prices: Price[];
  policies: RecurrencePolicy[];
  availableQuantity?: number | null;
  isOutOfStock?: boolean;
}

export function SubscribeAndSaveBox({
  productId,
  variantId,
  prices,
  policies,
  availableQuantity,
  isOutOfStock = false,
}: SubscribeAndSaveBoxProps) {
  const { addItem, addItemWithRecurrence, loading } = useCart();

  const oneTimePrice = prices.find((p) => !p.recurrencePolicy);
  const recurringPrices = prices.filter((p) => p.recurrencePolicy);

  // Only show policies that have a matching recurring price
  const availablePolicies = policies.filter((pol) =>
    recurringPrices.some((p) => p.recurrencePolicy?.id === pol.id)
  );

  const [mode, setMode] = useState<'one-time' | 'subscribe'>('one-time');
  const [selectedPolicyId, setSelectedPolicyId] = useState(availablePolicies[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedRecurringPrice = recurringPrices.find(
    (p) => p.recurrencePolicy?.id === selectedPolicyId
  );
  const displayPrice = mode === 'subscribe' ? selectedRecurringPrice : oneTimePrice;

  const maxQty = typeof availableQuantity === 'number' ? availableQuantity : undefined;
  const cantAdd = isOutOfStock;

  const handleAdd = async () => {
    if (mode === 'subscribe' && selectedPolicyId) {
      await addItemWithRecurrence(productId, variantId, quantity, selectedPolicyId);
    } else {
      await addItem(productId, variantId, quantity);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Mode selection */}
      <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
        {/* One-time */}
        <label className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="purchase-mode"
              value="one-time"
              checked={mode === 'one-time'}
              onChange={() => setMode('one-time')}
              className="accent-primary"
            />
            <span className="text-sm font-medium">One-time purchase</span>
          </div>
          {oneTimePrice && (
            <span className="text-sm font-semibold text-gray-900">
              {formatMoney(oneTimePrice.value)}
            </span>
          )}
        </label>

        {/* Subscribe & Save */}
        <label className="flex items-start justify-between px-4 py-3 cursor-pointer hover:bg-gray-50">
          <div className="flex items-start gap-3 flex-1">
            <input
              type="radio"
              name="purchase-mode"
              value="subscribe"
              checked={mode === 'subscribe'}
              onChange={() => setMode('subscribe')}
              className="accent-primary mt-0.5"
            />
            <div className="flex-1">
              <span className="text-sm font-medium">Subscribe &amp; Save</span>
              {mode === 'subscribe' && availablePolicies.length > 0 && (
                <div className="mt-2">
                  <select
                    value={selectedPolicyId}
                    onChange={(e) => setSelectedPolicyId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {availablePolicies.map((pol) => (
                      <option key={pol.id} value={pol.id}>
                        {pol.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          {selectedRecurringPrice && (
            <span className="text-sm font-semibold text-primary ml-4 mt-0.5">
              {formatMoney(selectedRecurringPrice.value)}
            </span>
          )}
        </label>
      </div>

      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border border-slate-300">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || cantAdd}
            className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={maxQty}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1) {
                setQuantity(maxQty ? Math.min(val, maxQty) : val);
              }
            }}
            disabled={cantAdd}
            className="w-14 border-x border-slate-300 py-2 text-center text-sm text-slate-900 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => setQuantity((q) => (maxQty ? Math.min(q + 1, maxQty) : q + 1))}
            disabled={cantAdd || (maxQty !== undefined && quantity >= maxQty)}
            className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <Button
          onClick={handleAdd}
          loading={loading}
          disabled={cantAdd || (mode === 'subscribe' && !selectedPolicyId)}
          variant={added ? 'secondary' : 'primary'}
        >
          {isOutOfStock ? 'Out of Stock' : added ? 'Added!' : 'Add to Cart'}
        </Button>
      </div>

      {/* Stock indicator */}
      {typeof availableQuantity === 'number' && (
        <div>
          {availableQuantity > 10 ? (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              {availableQuantity} in stock
            </span>
          ) : availableQuantity > 0 ? (
            <span className="text-sm text-amber-600 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
              Low stock — {availableQuantity} left
            </span>
          ) : (
            <span className="text-sm text-red-600 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              Out of stock
            </span>
          )}
        </div>
      )}
    </div>
  );
}
