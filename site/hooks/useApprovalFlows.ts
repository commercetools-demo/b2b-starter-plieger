'use client';

import useSWR, { useSWRConfig } from 'swr';
import { KEY_APPROVAL_FLOWS, keyApprovalFlow } from '@/lib/cache-keys';

const LIMIT = 20;

async function approvalFlowsFetcher([, offset, status]: [string, number, string]): Promise<{ results: any[]; total: number }> {
  const params = new URLSearchParams({ limit: String(LIMIT), offset: String(offset) });
  if (status) params.set('status', status);
  const res = await fetch(`/api/approval-flows?${params}`);
  if (!res.ok) return { results: [], total: 0 };
  return res.json();
}

async function approvalFlowFetcher(key: string): Promise<any> {
  const id = key.replace('approval-flow-', '');
  const res = await fetch(`/api/approval-flows/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.approvalFlow ?? data;
}

export function useApprovalFlows(offset = 0, status = '') {
  return useSWR<{ results: any[]; total: number }>(
    [KEY_APPROVAL_FLOWS, offset, status] as const,
    approvalFlowsFetcher,
    { revalidateOnFocus: false },
  );
}

export function useApprovalFlow(id: string | null) {
  return useSWR<any>(
    id ? keyApprovalFlow(id) : null,
    approvalFlowFetcher,
    { revalidateOnFocus: false },
  );
}

export function useApprovalFlowMutations() {
  const { mutate } = useSWRConfig();

  async function performFlowAction(id: string, action: 'approve' | 'reject', reason?: string): Promise<any> {
    const body: Record<string, any> = { action };
    if (reason) body.reason = reason;
    const res = await fetch(`/api/approval-flows/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Failed to ${action} flow`);
    const data = await res.json();
    const updated = data.approvalFlow ?? data;
    mutate(keyApprovalFlow(id), updated, { revalidate: false });
    return updated;
  }

  return { performFlowAction };
}
