'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

function getUserRoles(businessUnit: any, userId: string): string[] {
  if (!businessUnit?.associates || !userId) return [];
  const associate = businessUnit.associates.find(
    (a: any) => a.customer?.id === userId
  );
  if (!associate) return [];
  return (
    associate.associateRoleAssignments
      ?.map((r: any) => r.associateRole?.key)
      .filter(Boolean) ?? []
  );
}

function roleBadgeVariant(role: string): 'info' | 'warning' | 'neutral' | 'success' {
  if (role === 'admin') return 'info';
  if (role === 'approver') return 'warning';
  if (role === 'buyer') return 'success';
  return 'neutral';
}

function roleLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { currentBusinessUnit, businessUnits, selectBusinessUnit } = useBusinessUnit();
  const { addToast } = useToast();

  const currentRoles = getUserRoles(currentBusinessUnit, user?.id ?? '');

  // Profile
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email] = useState(user?.email ?? '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName }),
      });
      if (!res.ok) throw new Error();
      addToast('Profile updated');
    } catch {
      addToast('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch('/api/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) throw new Error();
      addToast('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      addToast('Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>

      {/* Business Units & Roles Summary */}
      {businessUnits.length > 0 && user && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">Your business unit memberships and roles:</p>
          <div className="flex flex-col gap-2">
            {businessUnits.map((bu: any) => {
              const roles = getUserRoles(bu, user.id);
              const isCurrent = bu.key === currentBusinessUnit?.key;
              return (
                <div
                  key={bu.key}
                  className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${
                    isCurrent
                      ? 'border-blue-200 bg-blue-50/50'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isCurrent ? 'text-blue-900' : 'text-gray-800'}`}>
                      {bu.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Current</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {roles.map((role: string) => (
                      <Badge key={role} variant={roleBadgeVariant(role)}>
                        {roleLabel(role)}
                      </Badge>
                    ))}
                    {roles.length === 0 && (
                      <span className="text-xs text-gray-400">No role</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Profile */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Last Name" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <Input label="Email" name="email" type="email" value={email} onChange={() => {}} disabled />
          <Button variant="primary" loading={profileSaving}>Save Changes</Button>
        </form>
      </section>

      {/* Password */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        {passwordError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {passwordError}
          </div>
        )}
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button variant="primary" loading={passwordSaving}>Change Password</Button>
        </form>
      </section>

      {/* Switch Business Unit */}
      {businessUnits.length > 1 && (
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Switch Business Unit</h2>
          <div className="max-w-md">
            <Select
              label="Active Business Unit"
              options={businessUnits.map((bu: any) => ({ value: bu.key, label: bu.name }))}
              value={currentBusinessUnit?.key ?? ''}
              onChange={(e) => selectBusinessUnit(e.target.value)}
            />
          </div>
        </section>
      )}
    </div>
  );
}
