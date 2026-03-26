'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CartItem } from '@/components/cart/CartItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatMoney } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { localePath } = useLocale();
  const { cart, itemCount, applyDiscountCode } = useCart();
  const { addToast } = useToast();
  const [requestingQuote, setRequestingQuote] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);
    try {
      await applyDiscountCode(discountCode.trim());
      addToast('Discount code applied');
      setDiscountCode('');
    } catch {
      addToast('Invalid discount code');
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleRequestQuote = async () => {
    setRequestingQuote(true);
    try {
      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: cart?.id }),
      });
      if (!res.ok) throw new Error();
      addToast('Quote request submitted');
      router.push(localePath('/dashboard/quotes'));
    } catch {
      addToast('Failed to request quote');
    } finally {
      setRequestingQuote(false);
    }
  };

  if (!cart || itemCount === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Browse our products and add items to your cart."
          actionLabel="Browse Products"
          onAction={() => router.push(localePath('/products'))}
        />
      </div>
    );
  }

  const lineItems = cart.lineItems ?? [];
  const subtotal = cart.totalPrice;
  const taxTotal = cart.taxedPrice?.totalTax;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({itemCount} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {lineItems.map((item: any) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-medium">{formatMoney(subtotal)}</dd>
              </div>
              {taxTotal && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Tax</dt>
                  <dd className="font-medium">{formatMoney(taxTotal)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatMoney(cart.taxedPrice?.totalGross ?? subtotal)}</dd>
              </div>
            </dl>

            {/* Discount Code */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleApplyDiscount();
                }}
                className="flex gap-2"
              >
                <Input
                  label=""
                  name="discountCode"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Discount code"
                />
                <Button variant="secondary" size="sm" loading={applyingDiscount} className="shrink-0 self-end">
                  Apply
                </Button>
              </form>
              {cart.discountCodes && cart.discountCodes.length > 0 && (
                <div className="mt-2 space-y-1">
                  {cart.discountCodes.map((dc: any, i: number) => (
                    <div key={i} className="text-xs text-green-600 flex items-center gap-1">
                      <span>&#10003;</span>
                      <span>Code applied</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <Button variant="primary" size="lg" href={localePath('/checkout')} className="w-full">
                Proceed to Checkout
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                loading={requestingQuote}
                onClick={handleRequestQuote}
              >
                Request Quote
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" href={localePath('/products')}>Continue Shopping</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
