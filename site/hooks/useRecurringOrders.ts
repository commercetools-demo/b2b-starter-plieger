'use client';

import useSWR, { useSWRConfig } from 'swr';
import { KEY_RECURRING_ORDERS, keyRecurringOrder } from '@/lib/cache-keys';
import type { RecurringOrder } from '@/lib/types';

async function fetchRecurringOrders(): Promise<{ results: RecurringOrder[]; total: number }> {
  const res = await fetch('/api/recurring-orders');
  if (!res.ok) return { results: [], total: 0 };
  return res.json();
}

async function fetchRecurringOrder(id: string): Promise<RecurringOrder | null> {
  const res = await fetch(`/api/recurring-orders/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export function useRecurringOrders() {
  return useSWR(KEY_RECURRING_ORDERS, fetchRecurringOrders, { revalidateOnFocus: false });
}

export function useRecurringOrder(id: string) {
  return useSWR(keyRecurringOrder(id), () => fetchRecurringOrder(id), { revalidateOnFocus: false });
}

export function useRecurringOrderActions() {
  const { mutate } = useSWRConfig();

  async function doAction(id: string, action: 'pause' | 'resume' | 'cancel' | 'duplicate'): Promise<RecurringOrder> {
    const res = await fetch(`/api/recurring-orders/${id}/${action}`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `Failed to ${action}`);
    mutate(KEY_RECURRING_ORDERS);
    mutate(keyRecurringOrder(id));
    return data;
  }

  return {
    pauseOrder: (id: string) => doAction(id, 'pause'),
    resumeOrder: (id: string) => doAction(id, 'resume'),
    cancelOrder: (id: string) => doAction(id, 'cancel'),
    duplicateOrder: (id: string) => doAction(id, 'duplicate'),
  };
}
