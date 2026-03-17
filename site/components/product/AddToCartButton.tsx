'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';

export interface AddToCartButtonProps {
  productId: string;
  variantId: number;
  disabled?: boolean;
  availableQuantity?: number | null;
  isOutOfStock?: boolean;
}

export function AddToCartButton({
  productId,
  variantId,
  disabled = false,
  availableQuantity,
  isOutOfStock = false,
}: AddToCartButtonProps) {
  const { addItem, loading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const maxQty = typeof availableQuantity === 'number' ? availableQuantity : undefined;
  const cantAdd = disabled || isOutOfStock;

  const handleAdd = async () => {
    await addItem(productId, variantId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        {/* Quantity selector */}
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

        {/* Add to cart */}
        <Button
          onClick={handleAdd}
          loading={loading}
          disabled={cantAdd}
          variant={added ? 'secondary' : 'primary'}
        >
          {isOutOfStock ? 'Out of Stock' : added ? 'Added!' : 'Add to Cart'}
        </Button>
      </div>

      {/* Stock indicator */}
      {typeof availableQuantity === 'number' && (
        <div className="mt-2">
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
