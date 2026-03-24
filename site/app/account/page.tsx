'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { Address } from '@/lib/types';

type Tab = 'general' | 'security' | 'addresses';

const COUNTRIES = ['US', 'DE', 'GB', 'FR', 'ES'];

function AddressForm({
  address,
  onSave,
  onCancel,
}: {
  address?: Address;
  onSave: (a: Address) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Address>({
    country: address?.country ?? 'US',
    firstName: address?.firstName ?? '',
    lastName: address?.lastName ?? '',
    streetName: address?.streetName ?? '',
    streetNumber: address?.streetNumber ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    postalCode: address?.postalCode ?? '',
    ...(address ?? {}),
  });

  const set = (field: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="First Name" value={form.firstName ?? ''} onChange={set('firstName')} />
        <Input label="Last Name" value={form.lastName ?? ''} onChange={set('lastName')} />
      </div>
      <Input label="Street" value={form.streetName ?? ''} onChange={set('streetName')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={form.city ?? ''} onChange={set('city')} />
        <Input label="Postal Code" value={form.postalCode ?? ''} onChange={set('postalCode')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="State / Region" value={form.state ?? ''} onChange={set('state')} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select
            value={form.country}
            onChange={set('country')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="primary" onClick={() => onSave(form)}>Save Address</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) ?? 'general';
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();

  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // General form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  // Security form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>();
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetch('/api/account')
      .then((r) => r.json())
      .then((data) => {
        setAccount(data);
        setFirstName(data.firstName ?? '');
        setLastName(data.lastName ?? '');
        setEmail(data.email ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, router]);

  const setTab = (t: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', t);
    router.push(`?${params.toString()}`);
  };

  const handleSaveGeneral = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAccount(data);
      addToast('Profile updated successfully');
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addToast('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveAddress = async (address: Address) => {
    setAddressLoading(true);
    try {
      const method = 'PUT';
      const body = editingAddress?.id
        ? { addressId: editingAddress.id, address }
        : { address };
      const url = '/api/account/addresses';
      const res = await fetch(url, {
        method: editingAddress?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAccount(data);
      setShowAddressModal(false);
      setEditingAddress(undefined);
      addToast('Address saved');
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAccount(data);
      addToast('Address deleted');
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to delete address');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'security', label: 'Security' },
    { key: 'addresses', label: 'Addresses' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* General Tab */}
      {tab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="space-y-4 max-w-md">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button variant="primary" loading={saving}>Save Changes</Button>
        </form>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <Button variant="primary" loading={changingPassword}>Change Password</Button>
        </form>
      )}

      {/* Addresses Tab */}
      {tab === 'addresses' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold">Saved Addresses</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setEditingAddress(undefined); setShowAddressModal(true); }}
            >
              Add Address
            </Button>
          </div>
          {(account?.addresses ?? []).length === 0 ? (
            <p className="text-sm text-gray-500">No addresses saved yet.</p>
          ) : (
            <div className="space-y-3">
              {(account.addresses as Address[]).map((addr) => (
                <div key={addr.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                    <p>{addr.streetName} {addr.streetNumber}</p>
                    <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p>{addr.country}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setEditingAddress(addr); setShowAddressModal(true); }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeleteAddress(addr.id!)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => { setShowAddressModal(false); setEditingAddress(undefined); }}
        title={editingAddress?.id ? 'Edit Address' : 'Add Address'}
      >
        <AddressForm
          address={editingAddress}
          onSave={handleSaveAddress}
          onCancel={() => { setShowAddressModal(false); setEditingAddress(undefined); }}
        />
      </Modal>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-10 text-center text-sm text-gray-500">Loading…</div>}>
      <AccountPageContent />
    </Suspense>
  );
}
