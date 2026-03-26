'use client';

import useSWR, { useSWRConfig } from 'swr';
import { KEY_QUOTES, keyQuote, KEY_QUOTE_REQUESTS, keyQuoteRequest } from '@/lib/cache-keys';

const LIMIT = 20;

async function quotesFetcher([, offset]: [string, number]): Promise<{ results: any[]; total: number }> {
  const res = await fetch(`/api/quotes?limit=${LIMIT}&offset=${offset}`);
  if (!res.ok) return { results: [], total: 0 };
  return res.json();
}

async function quoteFetcher(key: string): Promise<any> {
  const id = key.replace('quote-', '');
  const res = await fetch(`/api/quotes/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.quote ?? data;
}

async function quoteRequestsFetcher([, offset]: [string, number]): Promise<{ results: any[]; total: number }> {
  const res = await fetch(`/api/quote-requests?limit=${LIMIT}&offset=${offset}`);
  if (!res.ok) return { results: [], total: 0 };
  return res.json();
}

async function quoteRequestFetcher(key: string): Promise<any> {
  const id = key.replace('quote-request-', '');
  const res = await fetch(`/api/quote-requests/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.quoteRequest ?? data;
}

export function useQuotes(offset = 0) {
  return useSWR<{ results: any[]; total: number }>(
    [KEY_QUOTES, offset] as const,
    quotesFetcher,
    { revalidateOnFocus: false },
  );
}

export function useQuote(id: string | null) {
  return useSWR<any>(
    id ? keyQuote(id) : null,
    quoteFetcher,
    { revalidateOnFocus: false },
  );
}

export function useQuoteRequests(offset = 0) {
  return useSWR<{ results: any[]; total: number }>(
    [KEY_QUOTE_REQUESTS, offset] as const,
    quoteRequestsFetcher,
    { revalidateOnFocus: false },
  );
}

export function useQuoteRequest(id: string | null) {
  return useSWR<any>(
    id ? keyQuoteRequest(id) : null,
    quoteRequestFetcher,
    { revalidateOnFocus: false },
  );
}

export function useQuoteMutations() {
  const { mutate } = useSWRConfig();

  async function performQuoteAction(id: string, action: string, version: number, extra?: Record<string, any>): Promise<any> {
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, version, ...extra }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || `Failed to ${action} quote`);
    }
    const data = await res.json();
    const updated = data.quote ?? data;
    mutate(keyQuote(id), updated, { revalidate: false });
    return updated;
  }

  async function cancelQuoteRequest(id: string, version: number): Promise<any> {
    const res = await fetch(`/api/quote-requests/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version }),
    });
    if (!res.ok) throw new Error('Failed to cancel quote request');
    const data = await res.json();
    const updated = data.quoteRequest ?? data;
    mutate(keyQuoteRequest(id), updated, { revalidate: false });
    return updated;
  }

  return { performQuoteAction, cancelQuoteRequest };
}
