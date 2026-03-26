'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { useWishlists, useWishlistMutations } from '@/hooks/useWishlists';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { WishlistCard } from '@/components/wishlists/WishlistCard';

export default function WishlistsPage() {
  const router = useRouter();
  const { localePath } = useLocale();
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();
  const { data, isLoading } = useWishlists();
  const { createWishlist, deleteWishlist } = useWishlistMutations();
  const wishlists = data?.results ?? [];

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  if (!isLoggedIn) {
    router.push(localePath('/login'));
    return null;
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createWishlist(newName.trim());
      setShowCreate(false);
      setNewName('');
      addToast('Wishlist created');
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to create wishlist');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this wishlist?')) return;
    try {
      await deleteWishlist(id);
      addToast('Wishlist deleted');
    } catch {
      addToast('Failed to delete wishlist');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Wishlists</h1>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          Create Wishlist
        </Button>
      </div>

      {wishlists.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No wishlists yet</p>
          <p className="text-sm">Create a wishlist to save products for later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wishlists.map((w: any) => (
            <WishlistCard key={w.id} wishlist={w} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Wishlist">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Wishlist Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="My Wishlist"
            required
          />
          <div className="flex gap-2">
            <Button variant="primary" loading={creating}>Create</Button>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
