'use client';

import useSWR from 'swr';
import { keySearchSuggestions } from '@/lib/cache-keys';

async function suggestionsFetcher(key: string): Promise<any[]> {
  const q = key.replace('search-suggestions-', '');
  const res = await fetch(`/api/products/search-suggestions?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  return res.json();
}

export function useSearchSuggestions(query: string) {
  return useSWR<any[]>(
    query.length >= 2 ? keySearchSuggestions(query) : null,
    suggestionsFetcher,
    { revalidateOnFocus: false, dedupingInterval: 300 },
  );
}
