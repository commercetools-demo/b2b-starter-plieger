'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface AddressForm {
  firstName: string;
  lastName: string;
  streetName: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const emptyAddress: AddressForm = {
  firstName: '',
  lastName: '',
  streetName: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'NL',
};

export default function AddressesPage() {
  const { currentBusinessUnit } = useBusinessUnit();
  const { addToast } = useToast();
  const { localePath } = useLocale();
  const [bu, setBu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<AddressForm>(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const buId = currentBusinessUnit?.id;

  const fetchBU = useCallback(async () => {
    if (!buId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/business-units/${buId}`);
      const data = await res.json();
      setBu(data.businessUnit ?? data);
    } catch {
      setBu(null);
    } finally {
      setLoading(false);
    }
  }, [buId]);

  useEffect(() => {
    fetchBU();
  }, [fetchBU]);

  const updateForm = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleAdd = async () => {
    if (!bu) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/business-units/${buId}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: bu.version, address: form }),
      });
      if (!res.ok) throw new Error();
      addToast('Address added');
      setAddOpen(false);
      setForm(emptyAddress);
      fetchBU();
    } catch {
      addToast('Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (addressId: string) => {
    if (!bu) return;
    setRemovingId(addressId);
    try {
      const res = await fetch(`/api/business-units/${buId}/addresses`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: bu.version, addressId }),
      });
      if (!res.ok) throw new Error();
      addToast('Address removed');
      fetchBU();
    } catch {
      addToast('Failed to remove address');
    } finally {
      setRemovingId(null);
    }
  };

  const handleToggleDefault = async (addressId: string, type: 'shipping' | 'billing') => {
    if (!bu) return;
    setTogglingId(addressId);
    try {
      const action = type === 'shipping'
        ? 'setDefaultShippingAddress'
        : 'setDefaultBillingAddress';
      const res = await fetch(`/api/business-units/${buId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: bu.version,
          actions: [{ action, addressId }],
        }),
      });
      if (!res.ok) throw new Error();
      addToast(`Default ${type} address updated`);
      fetchBU();
    } catch {
      addToast('Failed to update default');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    );
  }

  const addresses = bu?.addresses ?? [];
  const defaultShippingId = bu?.defaultShippingAddressId;
  const defaultBillingId = bu?.defaultBillingAddressId;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" size="sm" href={localePath('/dashboard/company')} className="mb-2">&larr; Bedrijf</Button>
          <h1 className="text-2xl font-bold">Adresen</h1>
        </div>
        <Button variant="primary" onClick={() => setAddOpen(true)}>Voeg adres toe</Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon="📍"
          title="Geen addressen"
          description="Voeg een adres toe"
          actionLabel="Voeg toe"
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr: any) => {
            const isDefaultShipping = addr.id === defaultShippingId;
            const isDefaultBilling = addr.id === defaultBillingId;
            return (
              <div key={addr.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex gap-2 mb-2">
                  {isDefaultShipping && <Badge variant="success">Default Shipping</Badge>}
                  {isDefaultBilling && <Badge variant="info">Default Billing</Badge>}
                </div>
                <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                <p className="text-sm text-gray-600">{addr.streetName}</p>
                <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                <p className="text-sm text-gray-600">{addr.country}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!isDefaultShipping && (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={togglingId === addr.id}
                      onClick={() => handleToggleDefault(addr.id, 'shipping')}
                    >
                      Verzend adres
                    </Button>
                  )}
                  {!isDefaultBilling && (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={togglingId === addr.id}
                      onClick={() => handleToggleDefault(addr.id, 'billing')}
                    >
                      Factuur adres
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    loading={removingId === addr.id}
                    onClick={() => handleRemove(addr.id)}
                  >
                    Verwijderen
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Address Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Address"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Annuleren</Button>
            <Button variant="primary" loading={saving} onClick={handleAdd}>Toevoegen</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Voornaam" name="firstName" value={form.firstName} onChange={updateForm('firstName')} />
          <Input label="Achternaam" name="lastName" value={form.lastName} onChange={updateForm('lastName')} />
          <div className="sm:col-span-2">
            <Input label="Straat" name="street" value={form.streetName} onChange={updateForm('streetName')} />
          </div>
          <Input label="Postcode" name="postalCode" value={form.postalCode} onChange={updateForm('postalCode')} />
          <Input label="Woonplaats" name="city" value={form.city} onChange={updateForm('city')} />
          <Input label="Land" name="country" value={form.country} onChange={updateForm('country')} />
        </div>
      </Modal>
    </div>
  );
}
