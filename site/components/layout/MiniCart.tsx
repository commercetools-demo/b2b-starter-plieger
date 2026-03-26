'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatMoney, localizedString } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/context/LocaleContext';

export function MiniCart() {
  const { cart, miniCartOpen, closeMiniCart, removeItem, loading } = useCart();
  const { localePath } = useLocale();

  if (!miniCartOpen) return null;

  const lineItems = cart?.lineItems ?? [];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={closeMiniCart}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Cart ({lineItems.length})
          </h2>
          <button
            onClick={closeMiniCart}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close cart"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lineItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="mb-2 text-4xl">&#128722;</span>
              <p className="text-sm text-slate-500">Your cart is empty</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lineItems.map((item) => {
                const image = item.variant.images?.[0];
                return (
                  <li key={item.id} className="flex gap-4 py-4">
                    {/* Image */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                      {image ? (
                        <img
                          src={image.url}
                          alt={localizedString(item.name)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          No img
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-medium text-slate-900">
                        {localizedString(item.name)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity} &middot; {formatMoney(item.price.value)}
                      </p>
                      <p className="mt-auto text-sm font-medium text-slate-900">
                        {formatMoney(item.totalPrice)}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={loading}
                      className="self-start rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label="Remove item"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {lineItems.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Subtotal</span>
              <span className="text-lg font-semibold text-slate-900">
                {formatMoney(cart?.totalPrice)}
              </span>
            </div>
            <div className="space-y-2">
              <Button
                href={localePath('/cart')}
                variant="secondary"
                className="w-full"
                onClick={closeMiniCart}
              >
                View Cart
              </Button>
              <Button
                href={localePath('/checkout')}
                variant="primary"
                className="w-full"
                onClick={closeMiniCart}
              >
                Checkout
              </Button>
              <Button
                href={localePath('/dashboard/quotes/request')}
                variant="ghost"
                className="w-full"
                onClick={closeMiniCart}
              >
                Request Quote
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
