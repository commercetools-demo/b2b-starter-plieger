'use client';

import useSWR, { useSWRConfig } from 'swr';
import { keyRatings } from '@/lib/cache-keys';

interface RatingsData {
  results: any[];
  summary: { averageRating: number; totalReviews: number } | null;
}

async function ratingsFetcher(productId: string, sort: string): Promise<RatingsData> {
  const res = await fetch(`/api/ratings/${productId}?sort=${sort}&limit=10`);
  if (!res.ok) return { results: [], summary: null };
  const data = await res.json();
  return { results: data.results ?? [], summary: data.summary ?? null };
}

export function useRatings(productId: string, sort: string) {
  return useSWR<RatingsData>(
    keyRatings(productId, sort),
    () => ratingsFetcher(productId, sort),
    { revalidateOnFocus: false },
  );
}

export function useRatingMutations(productId: string, sort: string) {
  const { mutate } = useSWRConfig();

  async function submitReview(rating: number, comment: string, title?: string): Promise<void> {
    const res = await fetch(`/api/ratings/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment, title }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to submit review');
    mutate(keyRatings(productId, sort));
  }

  return { submitReview };
}
