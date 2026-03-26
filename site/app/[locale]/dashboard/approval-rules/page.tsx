'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  PredicateBuilder,
  parsePredicate,
  buildPredicateString,
  type PredicateCondition,
} from '@/components/approval-rules/PredicateBuilder';

const LIMIT = 20;

const roleOptions = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'admin', label: 'Admin' },
  { value: 'approver', label: 'Approver' },
];

interface EditForm {
  name: string;
  description: string;
  status: string;
  conditions: PredicateCondition[];
  requesters: string[];
  approvers: { role: string; tier: number }[];
}

const emptyForm: EditForm = {
  name: '',
  description: '',
  status: 'Active',
  conditions: [{ field: 'totalPrice', operator: '>', currency: 'USD', value: '' }],
  requesters: [],
  approvers: [{ role: '', tier: 1 }],
};

export default function ApprovalRulesPage() {
  const { addToast } = useToast();
  const { localePath } = useLocale();
  const [rules, setRules] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/approval-rules?limit=${LIMIT}&offset=${offset}`);
      const data = await res.json();
      setRules(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const openEdit = (rule: any) => {
    setEditingRule(rule);

    // Parse the predicate string back into visual conditions
    const conditions = parsePredicate(rule.predicate ?? '');

    // Extract requester role keys
    const requesters =
      rule.requesters?.map((r: any) => r.associateRole?.key).filter(Boolean) ?? [];

    // Extract approver tiers - handle nested or/and structure
    let approvers: { role: string; tier: number }[] = [];
    if (rule.approvers?.tiers) {
      approvers = rule.approvers.tiers.map((tier: any, i: number) => {
        // Structure: tiers[].and[].or[].associateRole.key
        const roleKey =
          tier?.and?.[0]?.or?.[0]?.associateRole?.key ??
          tier?.and?.[0]?.associateRole?.key ??
          '';
        return { role: roleKey, tier: i + 1 };
      });
    }
    if (approvers.length === 0) {
      approvers = [{ role: '', tier: 1 }];
    }

    setForm({
      name: rule.name ?? '',
      description: rule.description ?? '',
      status: rule.status ?? 'Active',
      conditions,
      requesters,
      approvers,
    });
    setModalOpen(true);
  };

  const toggleRequester = (role: string) => {
    setForm((prev) => ({
      ...prev,
      requesters: prev.requesters.includes(role)
        ? prev.requesters.filter((r) => r !== role)
        : [...prev.requesters, role],
    }));
  };

  const updateApprover = (index: number, field: 'role' | 'tier', value: string | number) => {
    setForm((prev) => {
      const approvers = [...prev.approvers];
      approvers[index] = { ...approvers[index], [field]: value };
      return { ...prev, approvers };
    });
  };

  const addApproverTier = () => {
    setForm((prev) => ({
      ...prev,
      approvers: [...prev.approvers, { role: '', tier: prev.approvers.length + 1 }],
    }));
  };

  const removeApproverTier = (index: number) => {
    setForm((prev) => ({
      ...prev,
      approvers: prev.approvers
        .filter((_, i) => i !== index)
        .map((a, i) => ({ ...a, tier: i + 1 })),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      addToast('Name is required');
      return;
    }
    if (form.approvers.some((a) => !a.role)) {
      addToast('All approver tiers must have a role selected');
      return;
    }

    setSaving(true);
    try {
      const predicate = buildPredicateString(form.conditions);

      if (editingRule) {
        // Update existing rule using update actions
        const actions: any[] = [];

        if (form.name !== editingRule.name) {
          actions.push({ action: 'setName', name: form.name });
        }
        if (form.description !== (editingRule.description ?? '')) {
          actions.push({ action: 'setDescription', description: form.description });
        }
        if (form.status !== editingRule.status) {
          actions.push({ action: 'setStatus', status: form.status });
        }
        if (predicate !== editingRule.predicate) {
          actions.push({ action: 'setPredicate', predicate });
        }

        // Always update approvers and requesters for simplicity
        actions.push({
          action: 'setApprovers',
          approvers: {
            tiers: form.approvers.map((a) => ({
              and: [{ or: [{ associateRole: { key: a.role, typeId: 'associate-role' } }] }],
            })),
          },
        });
        actions.push({
          action: 'setRequesters',
          requesters: form.requesters.map((r) => ({
            associateRole: { key: r, typeId: 'associate-role' },
          })),
        });

        const res = await fetch(`/api/approval-rules/${editingRule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: editingRule.version, actions }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update rule');
        }
      }

      addToast('Rule updated');
      setModalOpen(false);
      fetchRules();
    } catch (e: any) {
      addToast(e.message || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (row: any) => <span className="font-medium">{row.name}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'neutral'}>{row.status}</Badge>
      ),
    },
    {
      key: 'predicate',
      header: 'Predicate',
      render: (row: any) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">{row.predicate}</code>
      ),
    },
    {
      key: 'requesters',
      header: 'Requesters',
      render: (row: any) =>
        row.requesters
          ?.map((r: any) => {
            const key = r.associateRole?.key ?? '';
            return key.replace('-role', '').replace(/^\w/, (c: string) => c.toUpperCase());
          })
          .join(', ') || '—',
    },
    {
      key: 'actions',
      header: '',
      render: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Approval Rules</h1>
        <Button variant="primary" href={localePath('/dashboard/approval-rules/new')}>
          Create Rule
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <Table columns={columns} data={rules} loading={loading} emptyMessage="No approval rules found." />
        {total > LIMIT && (
          <div className="mt-6">
            <Pagination total={total} limit={LIMIT} offset={offset} onChange={setOffset} />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Approval Rule"
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Update
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <Select
            label="Status"
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
          />

          {/* Predicate Builder */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Conditions</p>
            <PredicateBuilder
              conditions={form.conditions}
              onChange={(conditions) => setForm((p) => ({ ...p, conditions }))}
            />
          </div>

          {/* Requesters */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Requesters</p>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                    form.requesters.includes(opt.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.requesters.includes(opt.value)}
                    onChange={() => toggleRequester(opt.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Approvers */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Approvers</p>
            <div className="space-y-2">
              {form.approvers.map((a, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex-shrink-0">
                    {a.tier}
                  </div>
                  <div className="flex-1">
                    <Select
                      label={`Tier ${a.tier} Role`}
                      options={[{ value: '', label: 'Select role...' }, ...roleOptions]}
                      value={a.role}
                      onChange={(e) => updateApprover(i, 'role', e.target.value)}
                    />
                  </div>
                  {form.approvers.length > 1 && (
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addApproverTier}>
                + Add Tier
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
