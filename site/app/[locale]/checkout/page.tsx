'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatMoney, localizedString } from '@/lib/utils';

interface AddressForm {
  firstName: string;
  lastName: string;
  streetName: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const emptyAddress: AddressForm = {
  firstName: '',
  lastName: '',
  streetName: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
};

function AddressFields({
  address,
  onChange,
  prefix,
}: {
  address: AddressForm;
  onChange: (field: string, value: string) => void;
  prefix: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input label="First Name" name={`${prefix}-firstName`} value={address.firstName} onChange={(e) => onChange('firstName', e.target.value)} />
      <Input label="Last Name" name={`${prefix}-lastName`} value={address.lastName} onChange={(e) => onChange('lastName', e.target.value)} />
      <div className="sm:col-span-2">
        <Input label="Street Address" name={`${prefix}-street`} value={address.streetName} onChange={(e) => onChange('streetName', e.target.value)} />
      </div>
      <Input label="City" name={`${prefix}-city`} value={address.city} onChange={(e) => onChange('city', e.target.value)} />
      <Input label="State / Province" name={`${prefix}-state`} value={address.state} onChange={(e) => onChange('state', e.target.value)} />
      <Input label="Postal Code" name={`${prefix}-postalCode`} value={address.postalCode} onChange={(e) => onChange('postalCode', e.target.value)} />
      <Input label="Country" name={`${prefix}-country`} value={address.country} onChange={(e) => onChange('country', e.target.value)} />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { localePath } = useLocale();
  const { cart } = useCart();
  const { addToast } = useToast();
  const [shipping, setShipping] = useState<AddressForm>(emptyAddress);
  const [billing, setBilling] = useState<AddressForm>(emptyAddress);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [poNumber, setPoNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateShipping = (field: string, value: string) =>
    setShipping((prev) => ({ ...prev, [field]: value }));
  const updateBilling = (field: string, value: string) =>
    setBilling((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart?.id,
          shippingAddress: shipping,
          billingAddress: sameAsShipping ? shipping : billing,
          purchaseOrderNumber: poNumber || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Checkout failed');
      }
      const data = await res.json();
      const order = data.order ?? data;
      router.push(localePath(`/checkout/confirmation?orderId=${order.id}`));
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      addToast('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.lineItems?.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Nothing to check out</h1>
        <p className="text-gray-600 mb-6">Your cart is empty.</p>
        <Button variant="primary" href={localePath('/products')}>Browse Products</Button>
      </div>
    );
  }

  const subtotal = cart.totalPrice;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping */}
            <section className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <AddressFields address={shipping} onChange={updateShipping} prefix="shipping" />
            </section>

            {/* Billing */}
            <section className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
              <label className="flex items-center gap-2 mb-4 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Same as shipping address
              </label>
              {!sameAsShipping && (
                <AddressFields address={billing} onChange={updateBilling} prefix="billing" />
              )}
            </section>

            {/* PO Number */}
            <section className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Purchase Order</h2>
              <Input
                label="PO Number (optional)"
                name="poNumber"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="Enter your purchase order number"
              />
            </section>
          </div>

          {/* Summary Sidebar */}
          <div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <ul className="space-y-3 mb-4">
                {cart.lineItems.map((item: any) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate mr-2">
                      {localizedString(item.name)} x{item.quantity}
                    </span>
                    <span className="font-medium shrink-0">{formatMoney(item.totalPrice)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatMoney(cart.taxedPrice?.totalGross ?? subtotal)}</span>
              </div>
              <Button variant="primary" size="lg" className="w-full mt-6" loading={loading}>
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
