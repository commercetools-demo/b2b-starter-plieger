'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { useWishlist, useWishlistMutations } from '@/hooks/useWishlists';
import { Button } from '@/components/ui/Button';
import { WishlistItemRow } from '@/components/wishlists/WishlistItemRow';
import { localizedString } from '@/lib/utils';

export default function WishlistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { localePath } = useLocale();
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();
  const { data: wishlist, isLoading } = useWishlist(id);
  const { removeItem } = useWishlistMutations();

  if (!isLoggedIn) {
    router.push(localePath('/login'));
    return null;
  }

  const handleRemoveItem = async (lineItemId: string) => {
    try {
      await removeItem(id, lineItemId);
      addToast('Item removed');
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h1 className="text-xl font-bold mb-2">Wishlist not found</h1>
        <Button variant="primary" href={localePath('/wishlists')}>Back to Wishlists</Button>
      </div>
    );
  }

  const name = typeof wishlist.name === 'object' ? localizedString(wishlist.name) : wishlist.name;
  const items = wishlist.lineItems ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" href={localePath('/wishlists')} size="sm">← Back</Button>
        <h1 className="text-2xl font-bold">{name}</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-500 rounded-xl border border-dashed border-gray-300">
          <p className="text-base">This wishlist is empty.</p>
          <p className="text-sm mt-1">Browse products and save items here.</p>
          <div className="mt-4">
            <Button variant="primary" href={localePath('/products')}>Browse Products</Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          {items.map((item: any) => (
            <WishlistItemRow
              key={item.id}
              item={item}
              wishlistId={id}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
