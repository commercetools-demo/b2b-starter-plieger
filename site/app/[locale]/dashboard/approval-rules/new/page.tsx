'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  PredicateBuilder,
  buildPredicateString,
  type PredicateCondition,
} from '@/components/approval-rules/PredicateBuilder';

const roleOptions = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'admin', label: 'Admin' },
  { value: 'approver', label: 'Approver' },
];

export default function CreateApprovalRulePage() {
  const router = useRouter();
  const { localePath } = useLocale();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [conditions, setConditions] = useState<PredicateCondition[]>([
    { field: 'totalPrice', operator: '>', currency: 'USD', value: '' },
  ]);
  const [requesters, setRequesters] = useState<string[]>([]);
  const [approvers, setApprovers] = useState<{ role: string; tier: number }[]>([
    { role: '', tier: 1 },
  ]);

  const toggleRequester = (role: string) => {
    setRequesters((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const updateApprover = (index: number, field: 'role' | 'tier', value: string | number) => {
    setApprovers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addApproverTier = () => {
    setApprovers((prev) => [...prev, { role: '', tier: prev.length + 1 }]);
  };

  const removeApproverTier = (index: number) => {
    setApprovers((prev) =>
      prev.filter((_, i) => i !== index).map((a, i) => ({ ...a, tier: i + 1 }))
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      addToast('Name is required');
      return;
    }
    if (requesters.length === 0) {
      addToast('Select at least one requester role');
      return;
    }
    if (approvers.some((a) => !a.role)) {
      addToast('All approver tiers must have a role selected');
      return;
    }

    setSaving(true);
    try {
      const predicate = buildPredicateString(conditions);
      const body = {
        name,
        ...(description.trim() ? { description } : {}),
        status,
        predicate,
        approvers: {
          tiers: approvers.map((a) => ({
            and: [{ or: [{ associateRole: { key: a.role, typeId: 'associate-role' } }] }],
          })),
        },
        requesters: requesters.map((r) => ({
          associateRole: { key: r, typeId: 'associate-role' },
        })),
      };

      const res = await fetch('/api/approval-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create rule');
      }
      addToast('Approval rule created');
      router.push(localePath('/dashboard/approval-rules'));
    } catch (e: any) {
      addToast(e.message || 'Failed to create rule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <Button variant="ghost" size="sm" href={localePath('/dashboard/approval-rules')} className="mb-4">
        &larr; Back to Approval Rules
      </Button>

      <h1 className="text-2xl font-bold mb-6">Create Approval Rule</h1>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Rule Details</h2>
          <div className="space-y-4">
            <Input
              label="Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High-value order approval"
            />
            <Input
              label="Description (optional)"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when this rule should trigger..."
            />
            <Select
              label="Status"
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
        </div>

        {/* Predicate Builder */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-1">Conditions</h2>
          <p className="text-sm text-gray-500 mb-4">
            Define when this rule triggers. Orders matching <strong>all</strong> conditions will
            require approval.
          </p>
          <PredicateBuilder conditions={conditions} onChange={setConditions} />
        </div>

        {/* Requesters */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-1">Requesters</h2>
          <p className="text-sm text-gray-500 mb-4">
            Which roles can trigger this rule when they place an order?
          </p>
          <div className="flex flex-wrap gap-3">
            {roleOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  requesters.includes(opt.value)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={requesters.includes(opt.value)}
                  onChange={() => toggleRequester(opt.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Approvers */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-1">Approvers</h2>
          <p className="text-sm text-gray-500 mb-4">
            Who must approve? Add multiple tiers for sequential approval (Tier 1 approves first,
            then Tier 2, etc.).
          </p>
          <div className="space-y-3">
            {approvers.map((a, i) => (
              <div key={i} className="flex items-end gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-bold flex-shrink-0">
                  {a.tier}
                </div>
                <div className="flex-1">
                  <Select
                    label={`Tier ${a.tier} Approver Role`}
                    options={[{ value: '', label: 'Select role...' }, ...roleOptions]}
                    value={a.role}
                    onChange={(e) => updateApprover(i, 'role', e.target.value)}
                  />
                </div>
                {approvers.length > 1 && (
                  <button
                    onClick={() => removeApproverTier(i)}
                    className="mb-1 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove tier"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addApproverTier}>
              + Add Approval Tier
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="primary" loading={saving} onClick={handleSave}>
            Create Rule
          </Button>
          <Button variant="ghost" href={localePath('/dashboard/approval-rules')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
