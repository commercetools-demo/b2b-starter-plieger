'use client';

import useSWR from 'swr';
import { keyProducts } from '@/lib/cache-keys';

interface ProductSearchResult {
  results: any[];
  total: number;
  facets: any[];
}

async function productsFetcher([, bodyJson]: [string, string]): Promise<ProductSearchResult> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyJson,
  });
  if (!res.ok) return { results: [], total: 0, facets: [] };
  return res.json();
}

export function useProducts(body: object | null) {
  return useSWR<ProductSearchResult>(
    body ? keyProducts(body) : null,
    productsFetcher,
    { revalidateOnFocus: false },
  );
}
