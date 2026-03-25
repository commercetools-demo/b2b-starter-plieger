'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { Address } from '@/lib/types';

const COUNTRIES = ['US', 'DE', 'GB', 'FR', 'ES'];

function AddressFormFields({
  form,
  onChange,
}: {
  form: Address;
  onChange: (field: keyof Address, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="First Name" value={form.firstName ?? ''} onChange={(e) => onChange('firstName', e.target.value)} />
        <Input label="Last Name" value={form.lastName ?? ''} onChange={(e) => onChange('lastName', e.target.value)} />
      </div>
      <Input label="Street" value={form.streetName ?? ''} onChange={(e) => onChange('streetName', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={form.city ?? ''} onChange={(e) => onChange('city', e.target.value)} />
        <Input label="Postal Code" value={form.postalCode ?? ''} onChange={(e) => onChange('postalCode', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
        <select
          value={form.country}
          onChange={(e) => onChange('country', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}

const blankAddress: Address = { country: 'US', firstName: '', lastName: '', streetName: '', city: '', postalCode: '' };

export default function DashboardAddressesPage() {
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Address | undefined>();
  const [form, setForm] = useState<Address>(blankAddress);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = () => {
    setLoading(true);
    fetch('/api/account')
      .then((r) => r.json())
      .then((data) => setAddresses(data.addresses ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAddresses(); }, []);

  const openAdd = () => { setEditing(undefined); setForm(blankAddress); setShowModal(true); };
  const openEdit = (addr: Address) => { setEditing(addr); setForm({ ...addr }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = editing?.id
        ? { addressId: editing.id, address: form }
        : { address: form };
      const res = await fetch('/api/account/addresses', {
        method: editing?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAddresses(data.addresses ?? []);
      setShowModal(false);
      addToast('Address saved');
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAddresses(data.addresses ?? []);
      addToast('Address deleted');
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>Add Address</Button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-gray-200 rounded" />)}
        </div>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-slate-500 py-8 text-center">No addresses saved yet.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-xl border border-slate-200 bg-white p-4 flex justify-between items-start">
              <div className="text-sm text-slate-700">
                <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                <p>{addr.streetName} {addr.streetNumber}</p>
                <p>{addr.city}, {addr.postalCode} {addr.country}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(addr)}>Edit</Button>
                <Button variant="secondary" size="sm" onClick={() => handleDelete(addr.id!)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing?.id ? 'Edit Address' : 'Add Address'}
      >
        <div className="space-y-4">
          <AddressFormFields form={form} onChange={(f, v) => setForm((prev) => ({ ...prev, [f]: v }))} />
          <div className="flex gap-2 pt-2">
            <Button variant="primary" loading={saving} onClick={handleSave}>Save Address</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
