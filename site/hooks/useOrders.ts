'use client';

import useSWR, { useSWRConfig } from 'swr';
import { KEY_ORDERS, keyOrder } from '@/lib/cache-keys';

const LIMIT = 20;

async function ordersFetcher([, offset, limit, status]: [string, number, number, string]): Promise<{ results: any[]; total: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (status) params.set('status', status);
  const res = await fetch(`/api/orders?${params}`);
  if (!res.ok) return { results: [], total: 0 };
  return res.json();
}

async function orderFetcher(key: string): Promise<any> {
  const id = key.replace('order-', '');
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.order ?? data;
}

export function useOrders(offset = 0, status = '', limit = LIMIT) {
  return useSWR<{ results: any[]; total: number }>(
    [KEY_ORDERS, offset, limit, status] as const,
    ordersFetcher,
    { revalidateOnFocus: false },
  );
}

export function useOrder(id: string | null) {
  return useSWR<any>(
    id ? keyOrder(id) : null,
    orderFetcher,
    { revalidateOnFocus: false },
  );
}

export function useOrderMutations() {
  const { mutate } = useSWRConfig();

  async function cancelOrder(id: string, version: number) {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version, orderState: 'Cancelled' }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to cancel order');
    }
    const data = await res.json();
    const updated = data.order ?? data;
    mutate(keyOrder(id), updated, { revalidate: false });
    return updated;
  }

  return { cancelOrder };
}
