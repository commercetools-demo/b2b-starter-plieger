'use client';

import useSWR, { useSWRConfig } from 'swr';
import { KEY_WISHLISTS, keyWishlist } from '@/lib/cache-keys';

async function wishlistsFetcher(): Promise<{ results: any[] }> {
  const res = await fetch('/api/wishlists');
  if (!res.ok) return { results: [] };
  return res.json();
}

async function wishlistFetcher(key: string): Promise<any> {
  const id = key.replace('wishlist-', '');
  const res = await fetch(`/api/wishlists/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export function useWishlists() {
  return useSWR<{ results: any[] }>(KEY_WISHLISTS, wishlistsFetcher, { revalidateOnFocus: false });
}

export function useWishlist(id: string | null) {
  return useSWR<any>(
    id ? keyWishlist(id) : null,
    wishlistFetcher,
    { revalidateOnFocus: false },
  );
}

export function useWishlistMutations() {
  const { mutate } = useSWRConfig();

  async function createWishlist(name: string): Promise<any> {
    const res = await fetch('/api/wishlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to create wishlist');
    }
    const data = await res.json();
    mutate(KEY_WISHLISTS);
    return data;
  }

  async function deleteWishlist(id: string) {
    const res = await fetch(`/api/wishlists/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete wishlist');
    mutate(KEY_WISHLISTS);
  }

  async function removeItem(wishlistId: string, lineItemId: string): Promise<any> {
    const res = await fetch(`/api/wishlists/${wishlistId}/items`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineItemId }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to remove item');
    }
    const data = await res.json();
    mutate(keyWishlist(wishlistId), data, { revalidate: false });
    return data;
  }

  return { createWishlist, deleteWishlist, removeItem };
}
