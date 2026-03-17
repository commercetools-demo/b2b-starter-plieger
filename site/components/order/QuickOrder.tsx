'use client';

import { useState, useRef, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { usePermissions } from '@/hooks/usePermissions';
import { localizedString, formatMoney } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface QuickOrderItem {
  sku: string;
  quantity: number;
  productId?: string;
  variantId?: number;
  name?: string;
  price?: any;
  imageUrl?: string;
  availableQuantity?: number | null;
  isOnStock?: boolean;
  status: 'pending' | 'found' | 'not_found' | 'loading';
  selected: boolean;
}

export function QuickOrder() {
  const { addItem, openMiniCart } = useCart();
  const { addToast } = useToast();
  const { hasAnyPermission } = usePermissions();
  const canManageCarts = hasAnyPermission(['CreateMyCarts', 'UpdateMyCarts']);
  const [isOpen, setIsOpen] = useState(false);
  const [skuInput, setSkuInput] = useState('');
  const [items, setItems] = useState<QuickOrderItem[]>([]);
  const [lookingUp, setLookingUp] = useState(false);
  const [adding, setAdding] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const lookupSku = useCallback(async (sku: string, quantity: number): Promise<QuickOrderItem> => {
    try {
      const res = await fetch(`/api/products/sku?sku=${encodeURIComponent(sku)}`);
      if (!res.ok) {
        return { sku, quantity, status: 'not_found', selected: false };
      }
      const data = await res.json();
      const product = data.product;
      const isOnStock = product.variant.isOnStock ?? true;
      const availableQuantity = product.variant.availableQuantity ?? null;
      const outOfStock = !isOnStock || (typeof availableQuantity === 'number' && availableQuantity <= 0);
      return {
        sku,
        quantity,
        productId: product.id,
        variantId: product.variant.id,
        name: typeof product.name === 'object' ? localizedString(product.name) : product.name,
        price: product.variant.price,
        imageUrl: product.variant.images?.[0]?.url,
        availableQuantity,
        isOnStock,
        status: 'found' as const,
        selected: !outOfStock,
      };
    } catch {
      return { sku, quantity, status: 'not_found', selected: false };
    }
  }, []);

  const handleSkuLookup = async () => {
    const sku = skuInput.trim().toUpperCase();
    if (!sku) return;

    // Check if already in list
    if (items.some((item) => item.sku === sku)) {
      addToast('SKU already in list');
      return;
    }

    setLookingUp(true);
    const item = await lookupSku(sku, 1);
    setItems((prev) => [...prev, item]);
    setSkuInput('');
    setLookingUp(false);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter((line) => line.trim());
    const parsed: { sku: string; quantity: number }[] = [];

    for (const line of lines) {
      const parts = line.split(/[,\t]/).map((s) => s.trim());
      const sku = parts[0]?.toUpperCase();
      const qty = parseInt(parts[1] ?? '1', 10);
      if (sku && !isNaN(qty) && qty > 0 && sku !== 'SKU') {
        parsed.push({ sku, quantity: qty });
      }
    }

    if (parsed.length === 0) {
      addToast('No valid SKUs found in file');
      return;
    }

    setLookingUp(true);
    const results = await Promise.all(
      parsed.map((p) => lookupSku(p.sku, p.quantity))
    );
    setItems((prev) => {
      const existingSkus = new Set(prev.map((i) => i.sku));
      const newItems = results.filter((r) => !existingSkus.has(r.sku));
      return [...prev, ...newItems];
    });
    setLookingUp(false);

    // Reset file input
    if (fileRef.current) fileRef.current.value = '';
  };

  const toggleItem = (sku: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.sku !== sku) return item;
        const max = typeof item.availableQuantity === 'number' ? item.availableQuantity : Infinity;
        return { ...item, quantity: Math.min(quantity, max) };
      })
    );
  };

  const removeItem = (sku: string) => {
    setItems((prev) => prev.filter((item) => item.sku !== sku));
  };

  const handleAddToCart = async () => {
    const selectedItems = items.filter((i) => i.selected && i.status === 'found');
    if (selectedItems.length === 0) return;

    setAdding(true);
    try {
      for (const item of selectedItems) {
        await addItem(item.productId!, item.variantId!, item.quantity);
      }
      addToast(`Added ${selectedItems.length} item(s) to cart`);
      setItems([]);
      setIsOpen(false);
      openMiniCart();
    } catch {
      addToast('Failed to add items to cart');
    } finally {
      setAdding(false);
    }
  };

  const selectedCount = items.filter((i) => i.selected && i.status === 'found').length;
  const foundCount = items.filter((i) => i.status === 'found').length;

  return (
    <>
      <button
        onClick={() => canManageCarts && setIsOpen(true)}
        disabled={!canManageCarts}
        className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${canManageCarts ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'}`}
        title={canManageCarts ? 'Quick Order' : 'Insufficient permissions to perform this task'}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="hidden lg:inline">Quick Order</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Quick Order"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleAddToCart}
              loading={adding}
              disabled={selectedCount === 0}
            >
              Add {selectedCount} Item{selectedCount !== 1 ? 's' : ''} to Cart
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* SKU Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Look up by SKU
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSkuLookup()}
                placeholder="Enter SKU..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button variant="secondary" onClick={handleSkuLookup} loading={lookingUp && items.length === 0}>
                Look Up
              </Button>
            </div>
          </div>

          {/* CSV Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Or upload CSV
            </label>
            <p className="text-xs text-gray-500 mb-2">
              CSV format: SKU, Quantity (one per line)
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleCsvUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {lookingUp && (
            <div className="text-sm text-gray-500 text-center py-2">
              Looking up SKUs...
            </div>
          )}

          {/* Results */}
          {items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 flex items-center justify-between">
                <span>{foundCount} found, {items.length - foundCount} not found</span>
                <button
                  onClick={() => setItems((prev) => prev.map((i) => i.status === 'found' ? { ...i, selected: true } : i))}
                  className="text-blue-600 hover:underline"
                >
                  Select All
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.sku}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      item.status === 'not_found' ? 'bg-red-50' : ''
                    }`}
                  >
                    {item.status === 'found' && (
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleItem(item.sku)}
                        disabled={typeof item.availableQuantity === 'number' && item.availableQuantity <= 0}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 disabled:opacity-40"
                      />
                    )}
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" className="h-10 w-10 rounded object-contain bg-white border" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.status === 'found' ? item.name : item.sku}
                      </p>
                      <p className="text-xs text-gray-500">
                        SKU: {item.sku}
                        {item.status === 'not_found' && (
                          <span className="text-red-600 ml-2">Not found</span>
                        )}
                      </p>
                    </div>
                    {item.status === 'found' && (
                      <>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded border text-gray-500 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded border text-gray-500 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right w-24">
                          {item.price && (
                            <span className="text-sm font-medium text-gray-700 block">
                              {formatMoney(item.price.value)}
                            </span>
                          )}
                          {typeof item.availableQuantity === 'number' && (
                            item.availableQuantity > 0 ? (
                              <span className="text-[10px] text-green-600">{item.availableQuantity} in stock</span>
                            ) : (
                              <span className="text-[10px] text-red-600 font-medium">Out of stock</span>
                            )
                          )}
                        </div>
                      </>
                    )}
                    <button
                      onClick={() => removeItem(item.sku)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
