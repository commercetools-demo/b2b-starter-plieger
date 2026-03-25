'use client';

import useSWR from 'swr';
import { KEY_RECURRENCE_POLICIES } from '@/lib/cache-keys';
import type { RecurrencePolicy } from '@/lib/types';

async function fetchRecurrencePolicies(): Promise<RecurrencePolicy[]> {
  const res = await fetch('/api/recurrence-policies');
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

export function useRecurrencePolicies() {
  return useSWR<RecurrencePolicy[]>(KEY_RECURRENCE_POLICIES, fetchRecurrencePolicies, {
    revalidateOnFocus: false,
  });
}
