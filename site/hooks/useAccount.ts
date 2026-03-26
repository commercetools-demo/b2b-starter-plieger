'use client';

import useSWR, { useSWRConfig } from 'swr';
import { KEY_ACCOUNT } from '@/lib/cache-keys';

async function accountFetcher(): Promise<any> {
  const res = await fetch('/api/account');
  if (!res.ok) return null;
  return res.json();
}

export function useAccount() {
  return useSWR<any>(KEY_ACCOUNT, accountFetcher, { revalidateOnFocus: false });
}

export function useAccountMutations() {
  const { mutate } = useSWRConfig();

  async function updateProfile(firstName: string, lastName: string, email: string): Promise<any> {
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to update profile');
    }
    const data = await res.json();
    mutate(KEY_ACCOUNT, data, { revalidate: false });
    return data;
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to change password');
    }
  }

  async function saveAddress(address: any, addressId?: string): Promise<any> {
    const body = addressId ? { addressId, address } : { address };
    const res = await fetch('/api/account/addresses', {
      method: addressId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to save address');
    }
    const data = await res.json();
    mutate(KEY_ACCOUNT, data, { revalidate: false });
    return data;
  }

  async function deleteAddress(addressId: string): Promise<any> {
    const res = await fetch('/api/account/addresses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressId }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to delete address');
    }
    const data = await res.json();
    mutate(KEY_ACCOUNT, data, { revalidate: false });
    return data;
  }

  return { updateProfile, changePassword, saveAddress, deleteAddress };
}
