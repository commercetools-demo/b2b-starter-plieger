'use client';

import useSWR, { useSWRConfig } from 'swr';
import { KEY_APPROVAL_RULES, keyApprovalRule } from '@/lib/cache-keys';

const LIMIT = 20;

async function approvalRulesFetcher([, offset]: [string, number]): Promise<{ results: any[]; total: number }> {
  const res = await fetch(`/api/approval-rules?limit=${LIMIT}&offset=${offset}`);
  if (!res.ok) return { results: [], total: 0 };
  return res.json();
}

async function approvalRuleFetcher(key: string): Promise<any> {
  const id = key.replace('approval-rule-', '');
  const res = await fetch(`/api/approval-rules/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.approvalRule ?? null;
}

export function useApprovalRules(offset = 0) {
  return useSWR<{ results: any[]; total: number }>(
    [KEY_APPROVAL_RULES, offset] as const,
    approvalRulesFetcher,
    { revalidateOnFocus: false },
  );
}

export function useApprovalRule(id: string | null) {
  return useSWR<any>(
    id ? keyApprovalRule(id) : null,
    approvalRuleFetcher,
    { revalidateOnFocus: false },
  );
}

export function useApprovalRuleMutations() {
  const { mutate } = useSWRConfig();

  async function createRule(body: object) {
    const res = await fetch('/api/approval-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to create rule');
    }
    mutate([KEY_APPROVAL_RULES, 0] as const);
  }

  async function updateRule(id: string, version: number, actions: any[]) {
    const res = await fetch(`/api/approval-rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version, actions }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to update rule');
    }
    mutate([KEY_APPROVAL_RULES, 0] as const);
  }

  async function toggleStatus(id: string, version: number, status: string) {
    const res = await fetch(`/api/approval-rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version, actions: [{ action: 'setStatus', status }] }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to update rule');
    }
    const data = await res.json();
    const updated = data.approvalRule;
    mutate(keyApprovalRule(id), updated, { revalidate: false });
    return updated;
  }

  return { createRule, updateRule, toggleStatus };
}
