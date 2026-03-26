'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { BusinessUnitCard } from '@/components/company/BusinessUnitCard';

export default function CompanyPage() {
  const { user } = useAuth();
  const { currentBusinessUnit } = useBusinessUnit();
  const { addToast } = useToast();
  const [bu, setBu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [createDivisionOpen, setCreateDivisionOpen] = useState(false);
  const [divisionName, setDivisionName] = useState('');
  const [divisionKey, setDivisionKey] = useState('');
  const [addSelfAsAssociate, setAddSelfAsAssociate] = useState(true);
  const [creatingDivision, setCreatingDivision] = useState(false);

  useEffect(() => {
    if (!currentBusinessUnit?.key) return;
    setLoading(true);
    fetch(`/api/business-units/${currentBusinessUnit.key}`)
      .then((r) => r.json())
      .then((data) => {
        const b = data.businessUnit ?? data;
        setBu(b);
        setEditName(b.name ?? '');
        setEditEmail(b.contactEmail ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentBusinessUnit]);

  const handleSave = async () => {
    if (!bu) return;
    setSaving(true);
    try {
      const actions: any[] = [];
      if (editName !== bu.name) {
        actions.push({ action: 'changeName', name: editName });
      }
      if (editEmail !== (bu.contactEmail ?? '')) {
        actions.push({ action: 'setContactEmail', contactEmail: editEmail || undefined });
      }
      if (actions.length === 0) {
        setEditing(false);
        return;
      }
      const res = await fetch(`/api/business-units/${bu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: bu.version, actions }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBu(data.businessUnit ?? data);
      setEditing(false);
      addToast('Business unit updated');
    } catch {
      addToast('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  // Get current user's role keys from the current BU
  const currentAssociate = currentBusinessUnit?.associates.find(
    (a) => a.customer.id === user?.id
  );
  const currentRoleKeys = currentAssociate?.associateRoleAssignments.map(
    (r) => r.associateRole.key
  ) ?? [];

  const handleCreateDivision = async () => {
    if (!divisionName.trim() || !divisionKey.trim()) return;
    setCreatingDivision(true);
    try {
      const draft: Record<string, unknown> = {
        name: divisionName.trim(),
        key: divisionKey.trim(),
        unitType: 'Division',
        parentUnit: { typeId: 'business-unit', key: bu.key },
        storeMode: 'FromParent',
      };

      if (addSelfAsAssociate && user) {
        draft.associates = [
          {
            customer: { id: user.id, typeId: 'customer' },
            associateRoleAssignments: currentRoleKeys.map((key) => ({
              associateRole: { key, typeId: 'associate-role' },
            })),
          },
        ];
      }

      const res = await fetch('/api/business-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error();
      addToast('Division created');
      setCreateDivisionOpen(false);
      setDivisionName('');
      setDivisionKey('');
      setAddSelfAsAssociate(true);
      // Refetch
      const refreshed = await fetch(`/api/business-units/${bu.key}`).then((r) => r.json());
      setBu(refreshed.businessUnit ?? refreshed);
    } catch {
      addToast('Failed to create division');
    } finally {
      setCreatingDivision(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!bu) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-2">No Business Unit Selected</h1>
        <p className="text-gray-600">Select a business unit to view company details.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Company</h1>

      {/* Overview */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold">Business Unit Details</h2>
          {!editing && <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>}
        </div>

        {editing ? (
          <div className="space-y-4 max-w-md">
            <Input label="Name" name="buName" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Input label="Contact Email" name="buEmail" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="primary" loading={saving} onClick={handleSave}>Save</Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium">{bu.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Key</dt>
              <dd className="font-medium font-mono">{bu.key}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd><Badge variant="info">{bu.unitType}</Badge></dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd><Badge variant={bu.status === 'Active' ? 'success' : 'neutral'}>{bu.status}</Badge></dd>
            </div>
            {bu.contactEmail && (
              <div>
                <dt className="text-gray-500">Contact Email</dt>
                <dd className="font-medium">{bu.contactEmail}</dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* Child Business Units */}
      {bu.children?.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Divisions</h2>
            {bu.unitType === 'Company' && (
              <Button variant="secondary" size="sm" onClick={() => setCreateDivisionOpen(true)}>
                Create Division
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bu.children.map((child: any) => (
              <BusinessUnitCard key={child.key} businessUnit={child} />
            ))}
          </div>
        </div>
      )}

      {bu.unitType === 'Company' && !bu.children?.length && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Divisions</h2>
            <Button variant="secondary" size="sm" onClick={() => setCreateDivisionOpen(true)}>
              Create Division
            </Button>
          </div>
          <p className="text-gray-500 text-sm">No divisions created yet.</p>
        </div>
      )}

      {/* Stores */}
      {bu.stores?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Stores</h2>
          <ul className="space-y-2">
            {bu.stores.map((store: any) => (
              <li key={store.key} className="text-sm p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{store.name ?? store.key}</span>
                <span className="text-gray-500 ml-2">({store.key})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create Division Modal */}
      <Modal
        isOpen={createDivisionOpen}
        onClose={() => setCreateDivisionOpen(false)}
        title="Create Division"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateDivisionOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={creatingDivision} onClick={handleCreateDivision}>Create</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Division Name" name="divName" value={divisionName} onChange={(e) => setDivisionName(e.target.value)} />
          <Input label="Division Key" name="divKey" value={divisionKey} onChange={(e) => setDivisionKey(e.target.value)} placeholder="e.g. my-division" />
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addSelfAsAssociate}
              onChange={(e) => setAddSelfAsAssociate(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Add me as an associate
              </span>
              {currentRoleKeys.length > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  With roles: {currentRoleKeys.join(', ')}
                </p>
              )}
            </div>
          </label>
        </div>
      </Modal>
    </div>
  );
}
