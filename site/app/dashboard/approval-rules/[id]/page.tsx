'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { ApprovalRule } from '@/lib/types';

export default function ApprovalRuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const [rule, setRule] = useState<ApprovalRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch(`/api/approval-rules/${id}`)
      .then((r) => r.json())
      .then((data) => setRule(data.approvalRule ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleStatus = async () => {
    if (!rule) return;
    setToggling(true);
    const newStatus = rule.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`/api/approval-rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: rule.version,
          actions: [{ action: 'setStatus', status: newStatus }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRule(data.approvalRule);
      addToast(`Rule set to ${newStatus}`);
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to update');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500 mb-4">Approval rule not found.</p>
        <Button variant="secondary" href="/dashboard/approval-rules">← Back</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" href="/dashboard/approval-rules" size="sm">← Back</Button>
        <h1 className="text-xl font-bold flex-1">{rule.name}</h1>
        <Badge variant={rule.status === 'Active' ? 'success' : 'neutral'}>{rule.status}</Badge>
      </div>

      <div className="space-y-6">
        {rule.description && (
          <p className="text-sm text-slate-600">{rule.description}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Predicate</h3>
            <code className="text-xs font-mono bg-slate-50 rounded p-2 block break-all">
              {rule.predicate}
            </code>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Requesters</h3>
            <ul className="space-y-1">
              {rule.requesters.map((r, i) => (
                <li key={i} className="text-sm text-slate-700">
                  <span className="font-mono text-xs bg-slate-100 rounded px-1.5 py-0.5">{r.associateRole.key}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Approval Hierarchy</h3>
          <div className="space-y-3">
            {rule.approvers.tiers.map((tier, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono w-16">Tier {i + 1}</span>
                <div className="flex flex-wrap gap-2">
                  {tier.and.map((a, j) => (
                    <span key={j} className="text-xs font-mono bg-slate-100 rounded px-1.5 py-0.5">
                      {a.associateRole.key}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Created {formatDate(rule.createdAt)}</span>
          <Button variant="secondary" size="sm" loading={toggling} onClick={handleToggleStatus}>
            Set to {rule.status === 'Active' ? 'Inactive' : 'Active'}
          </Button>
        </div>
      </div>
    </div>
  );
}
