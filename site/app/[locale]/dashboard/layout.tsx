'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { useLocale } from '@/context/LocaleContext';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { Select } from '@/components/ui/Select';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { localePath } = useLocale();
  const { isLoggedIn, loading: authLoading, user } = useAuth();
  const { currentBusinessUnit, businessUnits, selectBusinessUnit } = useBusinessUnit();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push(localePath('/login'));
    }
  }, [isLoggedIn, authLoading, router]);

  if (authLoading || !isLoggedIn) {
    return null;
  }

  if (!currentBusinessUnit && businessUnits.length > 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Selecteer een bedrijfsonderdeel</h2>
          <p className="text-gray-600 text-sm mb-6">
            Selecteer het bedrijfsonderdeel waar u mee wilt werken
          </p>
          <Select
            label="Business Unit"
            options={businessUnits.map((bu: any) => ({ value: bu.id, label: bu.name }))}
            value=""
            onChange={(e) => selectBusinessUnit(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <DashboardNav />
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
