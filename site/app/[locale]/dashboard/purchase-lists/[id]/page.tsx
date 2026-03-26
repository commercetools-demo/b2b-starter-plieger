'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { usePurchaseList, usePurchaseListMutations } from '@/hooks/usePurchaseLists';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatMoney, localizedString } from '@/lib/utils';

export default function PurchaseListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { localePath } = useLocale();
  const { data: list, isLoading } = usePurchaseList(id);
  const { addItem: addItemToList, removeItem } = usePurchaseListMutations();

  const [skuSearch, setSkuSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [addingAll, setAddingAll] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAddBySku = async () => {
    if (!skuSearch.trim()) return;
    setSearching(true);
    try {
      await addItemToList(id, skuSearch.trim());
      addToast('Item added to list');
      setSkuSearch('');
    } catch {
      addToast('Failed to add item. Check the SKU and try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleRemoveItem = async (lineItemId: string) => {
    setRemovingId(lineItemId);
    try {
      await removeItem(id, lineItemId);
      addToast('Item removed');
    } catch {
      addToast('Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (item: any) => {
    try {
      await addItem(item.productId, item.variant?.id ?? 1, item.quantity ?? 1);
      addToast('Added to cart');
    } catch {
      addToast('Failed to add to cart');
    }
  };

  const handleAddAllToCart = async () => {
    if (!list?.lineItems?.length) return;
    setAddingAll(true);
    for (const item of list.lineItems) {
      try {
        await addItem(item.productId, item.variant?.id ?? 1, item.quantity ?? 1);
      } catch {
        // skip items that fail
      }
    }
    addToast('All items added to cart');
    setAddingAll(false);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-2">List Not Found</h1>
        <Button variant="primary" href={localePath('/dashboard/purchase-lists')}>Back to Lists</Button>
      </div>
    );
  }

  const items = list.lineItems ?? [];

  return (
    <div>
      <Button variant="ghost" size="sm" href={localePath('/dashboard/purchase-lists')} className="mb-4">&larr; Back to Purchase Lists</Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{localizedString(list.name)}</h1>
        {items.length > 0 && (
          <Button variant="primary" loading={addingAll} onClick={handleAddAllToCart}>
            Add All to Cart
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddBySku();
          }}
          className="flex gap-3 items-end"
        >
          <div className="flex-1">
            <Input
              label="Quick Add by SKU"
              name="sku"
              value={skuSearch}
              onChange={(e) => setSkuSearch(e.target.value)}
              placeholder="Enter product SKU..."
            />
          </div>
          <Button variant="secondary" loading={searching}>Add</Button>
        </form>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No items in this list"
          description="Add products by SKU or from product pages."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              {item.variant?.images?.[0]?.url ? (
                <img src={item.variant.images[0].url} alt="" className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xl">?</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{localizedString(item.name)}</p>
                {item.variant?.sku && <p className="text-xs text-gray-500">SKU: {item.variant.sku}</p>}
                <p className="text-sm text-gray-600">Qty: {item.quantity ?? 1}</p>
              </div>
              {item.variant?.prices?.[0] && (
                <p className="font-medium text-sm">{formatMoney(item.variant.prices[0].value)}</p>
              )}
              <div className="flex gap-2 shrink-0">
                <Button variant="secondary" size="sm" onClick={() => handleAddToCart(item)}>
                  Add to Cart
                </Button>
                <Button variant="danger" size="sm" loading={removingId === item.id} onClick={() => handleRemoveItem(item.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
