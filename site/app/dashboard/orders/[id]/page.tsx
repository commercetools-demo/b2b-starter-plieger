'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { OrderStatus } from '@/components/orders/OrderStatus';
import { formatMoney, formatDate, localizedString } from '@/lib/utils';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const { addItem } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => setOrder(data.order ?? data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: order.version, orderState: 'Cancelled' }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrder(data.order ?? data);
      addToast('Order cancelled');
    } catch {
      addToast('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    if (!order?.lineItems) return;
    for (const item of order.lineItems) {
      try {
        await addItem(item.productId, item.variant?.id ?? 1, item.quantity);
      } catch {
        // skip items that fail
      }
    }
    addToast('Items added to cart');
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <Button variant="primary" href="/dashboard/orders">Back to Orders</Button>
      </div>
    );
  }

  const lineItemColumns = [
    {
      key: 'name',
      header: 'Product',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          {item.variant?.images?.[0]?.url && (
            <img src={item.variant.images[0].url} alt="" className="w-10 h-10 rounded object-cover" />
          )}
          <span>{localizedString(item.name)}</span>
        </div>
      ),
    },
    { key: 'sku', header: 'SKU', render: (item: any) => item.variant?.sku ?? '-' },
    { key: 'quantity', header: 'Qty', render: (item: any) => item.quantity },
    { key: 'price', header: 'Unit Price', render: (item: any) => formatMoney(item.price?.value) },
    { key: 'total', header: 'Total', render: (item: any) => formatMoney(item.totalPrice) },
  ];

  const renderAddress = (address: any) => {
    if (!address) return <span className="text-gray-400">Not provided</span>;
    return (
      <div className="text-sm">
        <p className="font-medium">{address.firstName} {address.lastName}</p>
        <p>{address.streetName}</p>
        <p>{address.city}, {address.state} {address.postalCode}</p>
        <p>{address.country}</p>
      </div>
    );
  };

  return (
    <div>
      {/* Back navigation */}
      <Button variant="ghost" size="sm" href="/dashboard/orders" className="mb-4">&larr; Back to Orders</Button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber ?? order.id.slice(0, 8)}</h1>
          <p className="text-gray-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatus state={order.orderState} />
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Items</h2>
        <Table columns={lineItemColumns} data={order.lineItems ?? []} loading={false} emptyMessage="No items" />
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
          {renderAddress(order.shippingAddress)}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-3">Billing Address</h2>
          {renderAddress(order.billingAddress)}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Order Total</h2>
        <dl className="space-y-2 text-sm max-w-xs">
          <div className="flex justify-between">
            <dt className="text-gray-600">Subtotal</dt>
            <dd className="font-medium">{formatMoney(order.totalPrice)}</dd>
          </div>
          {order.taxedPrice?.totalTax && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Tax</dt>
              <dd className="font-medium">{formatMoney(order.taxedPrice.totalTax)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-100 pt-2 font-bold">
            <dt>Total</dt>
            <dd>{formatMoney(order.taxedPrice?.totalGross ?? order.totalPrice)}</dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {order.orderState === 'Open' && (
          <Button variant="danger" loading={cancelling} onClick={handleCancel}>Cancel Order</Button>
        )}
        <Button variant="secondary" onClick={handleReorder}>Reorder</Button>
      </div>
    </div>
  );
}
