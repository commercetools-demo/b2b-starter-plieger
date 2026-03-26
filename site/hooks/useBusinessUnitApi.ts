import type { BusinessUnit } from '@/lib/types';

export async function businessUnitsFetcher(): Promise<BusinessUnit[]> {
  const res = await fetch('/api/business-units');
  if (!res.ok) return [];
  const data = await res.json();
  return data.businessUnits ?? data.results ?? (Array.isArray(data) ? data : []);
}

export async function selectBusinessUnitRequest(
  buId: string,
  buKey: string,
  storeKey: string,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/business-units/${buId}/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessUnitKey: buKey, storeKey }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
