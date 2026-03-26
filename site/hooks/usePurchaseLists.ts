'use client';

import useSWR, { useSWRConfig } from 'swr';
import { KEY_PURCHASE_LISTS, keyPurchaseList } from '@/lib/cache-keys';

async function purchaseListsFetcher(): Promise<{ results: any[] }> {
  const res = await fetch('/api/purchase-lists');
  if (!res.ok) return { results: [] };
  return res.json();
}

async function purchaseListFetcher(key: string): Promise<any> {
  const id = key.replace('purchase-list-', '');
  const res = await fetch(`/api/purchase-lists/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.purchaseList ?? data;
}

export function usePurchaseLists() {
  return useSWR<{ results: any[] }>(KEY_PURCHASE_LISTS, purchaseListsFetcher, { revalidateOnFocus: false });
}

export function usePurchaseList(id: string | null) {
  return useSWR<any>(
    id ? keyPurchaseList(id) : null,
    purchaseListFetcher,
    { revalidateOnFocus: false },
  );
}

export function usePurchaseListMutations() {
  const { mutate } = useSWRConfig();

  async function createList(name: string) {
    const res = await fetch('/api/purchase-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to create list');
    }
    mutate(KEY_PURCHASE_LISTS);
  }

  async function deleteList(id: string, version: number) {
    const res = await fetch(`/api/purchase-lists/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version }),
    });
    if (!res.ok) throw new Error('Failed to delete list');
    mutate(KEY_PURCHASE_LISTS);
  }

  async function addItem(listId: string, sku: string) {
    const res = await fetch(`/api/purchase-lists/${listId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku }),
    });
    if (!res.ok) throw new Error('Failed to add item');
    mutate(keyPurchaseList(listId));
  }

  async function removeItem(listId: string, lineItemId: string) {
    const res = await fetch(`/api/purchase-lists/${listId}/items/${lineItemId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove item');
    mutate(keyPurchaseList(listId));
  }

  return { createList, deleteList, addItem, removeItem };
}
