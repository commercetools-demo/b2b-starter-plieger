'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AssociateCard } from '@/components/company/AssociateCard';
import { EmptyState } from '@/components/ui/EmptyState';

const roleOptions = [
  { value: 'Buyer', label: 'Buyer' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Approver', label: 'Approver' },
];

export default function AssociatesPage() {
  const { currentBusinessUnit } = useBusinessUnit();
  const { addToast } = useToast();
  const [associates, setAssociates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Associate
  const [addOpen, setAddOpen] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('Buyer');
  const [adding, setAdding] = useState(false);

  // Edit Roles
  const [editOpen, setEditOpen] = useState(false);
  const [editAssociate, setEditAssociate] = useState<any>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  // Remove
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeAssociate, setRemoveAssociate] = useState<any>(null);
  const [removing, setRemoving] = useState(false);

  const buKey = currentBusinessUnit?.key;

  const fetchAssociates = useCallback(async () => {
    if (!buKey) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/business-units/${buKey}/associates`);
      const data = await res.json();
      setAssociates(data.results ?? data ?? []);
    } catch {
      setAssociates([]);
    } finally {
      setLoading(false);
    }
  }, [buKey]);

  useEffect(() => {
    fetchAssociates();
  }, [fetchAssociates]);

  const handleAdd = async () => {
    if (!addEmail.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/business-units/${buKey}/associates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail.trim(), role: addRole }),
      });
      if (!res.ok) throw new Error();
      addToast('Associate added');
      setAddOpen(false);
      setAddEmail('');
      setAddRole('Buyer');
      fetchAssociates();
    } catch {
      addToast('Failed to add associate');
    } finally {
      setAdding(false);
    }
  };

  const handleEditRoles = (associate: any) => {
    setEditAssociate(associate);
    setEditRoles(associate.associateRoleAssignments?.map((r: any) => r.associateRole?.key) ?? []);
    setEditOpen(true);
  };

  const handleSaveRoles = async () => {
    setEditSaving(true);
    try {
      const res = await fetch(`/api/business-units/${buKey}/associates/${editAssociate.customer?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: editRoles }),
      });
      if (!res.ok) throw new Error();
      addToast('Roles updated');
      setEditOpen(false);
      fetchAssociates();
    } catch {
      addToast('Failed to update roles');
    } finally {
      setEditSaving(false);
    }
  };

  const handleRemoveConfirm = (associate: any) => {
    setRemoveAssociate(associate);
    setRemoveOpen(true);
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await fetch(`/api/business-units/${buKey}/associates/${removeAssociate.customer?.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      addToast('Associate removed');
      setRemoveOpen(false);
      fetchAssociates();
    } catch {
      addToast('Failed to remove associate');
    } finally {
      setRemoving(false);
    }
  };

  const toggleEditRole = (role: string) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-32 bg-gray-200 rounded" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" size="sm" href="/dashboard/company" className="mb-2">&larr; Company</Button>
          <h1 className="text-2xl font-bold">Associates</h1>
        </div>
        <Button variant="primary" onClick={() => setAddOpen(true)}>Add Associate</Button>
      </div>

      {associates.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No associates"
          description="Add associates to this business unit."
          actionLabel="Add Associate"
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {associates.map((assoc: any, i: number) => (
            <AssociateCard
              key={assoc.customer?.id ?? i}
              associate={assoc}
              onEditRoles={() => handleEditRoles(assoc)}
              onRemove={() => handleRemoveConfirm(assoc)}
            />
          ))}
        </div>
      )}

      {/* Add Associate Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Associate"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={adding} onClick={handleAdd}>Add</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Customer Email" name="email" type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="associate@company.com" />
          <Select label="Role" options={roleOptions} value={addRole} onChange={(e) => setAddRole(e.target.value)} />
        </div>
      </Modal>

      {/* Edit Roles Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Roles"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={editSaving} onClick={handleSaveRoles}>Save</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-4">
          Select roles for {editAssociate?.customer?.email ?? 'this associate'}:
        </p>
        <div className="space-y-2">
          {roleOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={editRoles.includes(opt.value)}
                onChange={() => toggleEditRole(opt.value)}
                className="rounded border-gray-300"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </Modal>

      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={removeOpen}
        onClose={() => setRemoveOpen(false)}
        title="Remove Associate"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoveOpen(false)}>Cancel</Button>
            <Button variant="danger" loading={removing} onClick={handleRemove}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to remove{' '}
          <strong>{removeAssociate?.customer?.email ?? 'this associate'}</strong> from the business unit?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
