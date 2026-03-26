'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { usePurchaseLists, usePurchaseListMutations } from '@/hooks/usePurchaseLists';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, localizedString } from '@/lib/utils';

export default function PurchaseListsPage() {
  const router = useRouter();
  const { localePath } = useLocale();
  const { addToast } = useToast();
  const { user } = useAuth();
  const { currentBusinessUnit } = useBusinessUnit();
  const { can } = usePermissions();
  const { data, isLoading } = usePurchaseLists();
  const { createList, deleteList } = usePurchaseListMutations();
  const lists = data?.results ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canCreateMy = can('CreateMyShoppingLists');
  const canCreateOthers = can('CreateOthersShoppingLists');
  const canCreate = canCreateMy || canCreateOthers;
  const canDeleteMy = can('DeleteMyShoppingLists');
  const canDeleteOthers = can('DeleteOthersShoppingLists');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createList(newName.trim());
      addToast('Purchase list created');
      setCreateOpen(false);
      setNewName('');
    } catch {
      addToast('Failed to create list');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const list = lists.find((l: any) => l.id === id);
    if (!list) return;
    setDeletingId(id);
    try {
      await deleteList(id, list.version);
      addToast('Purchase list deleted');
    } catch {
      addToast('Failed to delete list');
    } finally {
      setDeletingId(null);
    }
  };

  const getOwnerName = (list: any): string => {
    const customerId = list.customer?.id;
    if (!customerId) return 'Unknown';
    if (customerId === user?.id) return 'Me';
    const associate = currentBusinessUnit?.associates.find(
      (a) => a.customer.id === customerId
    );
    if (associate?.customer.firstName || associate?.customer.lastName) {
      return `${associate.customer.firstName ?? ''} ${associate.customer.lastName ?? ''}`.trim();
    }
    return associate?.customer.email ?? 'Unknown';
  };

  const canDeleteList = (list: any): boolean => {
    const isOwner = list.customer?.id === user?.id;
    return (isOwner && canDeleteMy) || (!isOwner && canDeleteOthers);
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row: any) => {
        const name = typeof row.name === 'object' ? localizedString(row.name) : row.name;
        return (
          <a href={localePath(`/dashboard/purchase-lists/${row.id}`)} className="text-primary font-medium hover:underline">
            {name}
          </a>
        );
      },
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (row: any) => (
        <span className="text-sm text-gray-600">{getOwnerName(row)}</span>
      ),
    },
    { key: 'items', header: 'Items', render: (row: any) => row.lineItems?.length ?? 0 },
    { key: 'lastModifiedAt', header: 'Last Modified', render: (row: any) => formatDate(row.lastModifiedAt) },
    {
      key: 'actions',
      header: '',
      render: (row: any) =>
        canDeleteList(row) ? (
          <Button
            variant="danger"
            size="sm"
            loading={deletingId === row.id}
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
        ) : null,
    },
  ];

  if (!isLoading && lists.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Purchase Lists</h1>
          {canCreate ? (
            <Button variant="primary" onClick={() => setCreateOpen(true)}>Create List</Button>
          ) : (
            <div className="inline-flex flex-col items-center">
              <Button variant="primary" disabled>Create List</Button>
              <svg aria-label="Insufficient permissions to perform this task" role="img" className="h-4 w-4 text-red-400 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
          )}
        </div>
        <EmptyState
          icon="📋"
          title="No purchase lists"
          description="Create a purchase list to save your frequently ordered items."
          actionLabel={canCreate ? 'Create List' : undefined}
          onAction={canCreate ? () => setCreateOpen(true) : undefined}
        />
        <CreateModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          name={newName}
          onNameChange={setNewName}
          onSave={handleCreate}
          saving={creating}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Purchase Lists</h1>
        {canCreate ? (
          <Button variant="primary" onClick={() => setCreateOpen(true)}>Create List</Button>
        ) : (
          <div className="inline-flex flex-col items-center">
            <Button variant="primary" disabled>Create List</Button>
            <svg aria-label="Insufficient permissions to perform this task" role="img" className="h-4 w-4 text-red-400 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <Table columns={columns} data={lists} loading={isLoading} emptyMessage="No purchase lists." onRowClick={(row: any) => router.push(localePath(`/dashboard/purchase-lists/${row.id}`))} />
      </div>

      <CreateModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        name={newName}
        onNameChange={setNewName}
        onSave={handleCreate}
        saving={creating}
      />
    </div>
  );
}

function CreateModal({
  isOpen,
  onClose,
  name,
  onNameChange,
  onSave,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  onNameChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Purchase List"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={onSave}>Create</Button>
        </>
      }
    >
      <Input label="List Name" name="listName" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="e.g. Office Supplies" />
    </Modal>
  );
}
