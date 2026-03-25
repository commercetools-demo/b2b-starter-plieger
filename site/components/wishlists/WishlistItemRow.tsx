'use client';

import { localizedString } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface WishlistItemRowProps {
  item: {
    id: string;
    productId: string;
    name: Record<string, string>;
    variant: { id: number; sku?: string; images?: { url: string }[] };
    quantity: number;
  };
  wishlistId: string;
  onRemove: (lineItemId: string) => void;
}

export function WishlistItemRow({ item, onRemove }: WishlistItemRowProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const name = localizedString(item.name);
  const image = item.variant?.images?.[0]?.url;

  const handleAddToCart = async () => {
    try {
      await addItem(item.productId, item.variant?.id ?? 1, item.quantity);
      addToast(`${name} added to cart`);
    } catch {
      addToast('Failed to add to cart');
    }
  };

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
      {image ? (
        <img src={image} alt={name} className="h-14 w-14 rounded-md object-cover bg-slate-50" />
      ) : (
        <div className="h-14 w-14 rounded-md bg-slate-100 flex items-center justify-center text-xs text-slate-400">
          No img
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{name}</p>
        {item.variant?.sku && (
          <p className="text-xs text-slate-500">SKU: {item.variant.sku}</p>
        )}
        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleAddToCart}
          className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition-colors"
        >
          Add to Cart
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="text-xs text-slate-500 hover:text-red-600 px-2 py-1.5"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
