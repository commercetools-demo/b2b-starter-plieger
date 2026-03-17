'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import type { AssociateRole, Permission } from '@/lib/types';

let cachedRoles: AssociateRole[] | null = null;
let rolesFetchPromise: Promise<AssociateRole[]> | null = null;

async function fetchRoles(): Promise<AssociateRole[]> {
  if (cachedRoles) return cachedRoles;
  if (rolesFetchPromise) return rolesFetchPromise;
  rolesFetchPromise = fetch('/api/associate-roles')
    .then((res) => res.json())
    .then((data) => {
      const roles = data.results ?? data.roles ?? data ?? [];
      cachedRoles = Array.isArray(roles) ? roles : [];
      return roles;
    })
    .catch(() => {
      rolesFetchPromise = null;
      return [];
    });
  return rolesFetchPromise;
}

export function usePermissions() {
  const { user } = useAuth();
  const { currentBusinessUnit } = useBusinessUnit();
  const [roles, setRoles] = useState<AssociateRole[]>(cachedRoles ?? []);

  useEffect(() => {
    if (user) {
      fetchRoles().then(setRoles);
    }
  }, [user]);

  const currentAssociate = useMemo(() => {
    if (!user || !currentBusinessUnit) return null;
    return (
      currentBusinessUnit.associates.find(
        (a) => a.customer.id === user.id,
      ) ?? null
    );
  }, [user, currentBusinessUnit]);

  const roleKeys = useMemo(() => {
    if (!currentAssociate) return new Set<string>();
    return new Set(
      currentAssociate.associateRoleAssignments.map(
        (r) => r.associateRole.key,
      ),
    );
  }, [currentAssociate]);

  const permissions = useMemo(() => {
    const perms = new Set<string>();
    for (const role of roles) {
      if (roleKeys.has(role.key)) {
        for (const p of role.permissions) {
          perms.add(p);
        }
      }
    }
    return perms;
  }, [roles, roleKeys]);

  const can = useCallback(
    (permission: Permission | string): boolean => permissions.has(permission),
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (perms: (Permission | string)[]): boolean =>
      perms.some((p) => permissions.has(p)),
    [permissions],
  );

  const hasAllPermissions = useCallback(
    (perms: (Permission | string)[]): boolean =>
      perms.every((p) => permissions.has(p)),
    [permissions],
  );

  return { can, hasAnyPermission, hasAllPermissions, roleKeys, permissions };
}
