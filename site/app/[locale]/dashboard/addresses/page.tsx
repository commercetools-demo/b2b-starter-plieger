'use client';

import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { useAccount, useAccountMutations } from '@/hooks/useAccount';
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
  const { data: account, isLoading } = useAccount();
  const { saveAddress, deleteAddress } = useAccountMutations();
  const addresses: Address[] = account?.addresses ?? [];

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Address | undefined>();
  const [form, setForm] = useState<Address>(blankAddress);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditing(undefined); setForm(blankAddress); setShowModal(true); };
  const openEdit = (addr: Address) => { setEditing(addr); setForm({ ...addr }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAddress(form, editing?.id);
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
      await deleteAddress(addressId);
      addToast('Address deleted');
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mijn adressen</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>Voeg adres toe</Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-gray-200 rounded" />)}
        </div>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-slate-500 py-8 text-center">Er zijn nog geen adressen opgeslagen</p>
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
                <Button variant="secondary" size="sm" onClick={() => openEdit(addr)}>Bewerk</Button>
                <Button variant="secondary" size="sm" onClick={() => handleDelete(addr.id!)}>Verwijder</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing?.id ? 'Bewerk adres' : 'Nieuw Address'}
      >
        <div className="space-y-4">
          <AddressFormFields form={form} onChange={(f, v) => setForm((prev) => ({ ...prev, [f]: v }))} />
          <div className="flex gap-2 pt-2">
            <Button variant="primary" loading={saving} onClick={handleSave}>Sla adres op</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuleren</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
