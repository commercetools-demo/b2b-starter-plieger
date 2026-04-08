'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { classNames } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { useLocale } from '@/context/LocaleContext';

interface NavItem {
  label: string;
  href: string;
  requiredPermissions?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overzicht', href: '/dashboard' },
  { label: 'Bestellingen', href: '/dashboard/orders', requiredPermissions: ['ViewMyOrders', 'ViewOthersOrders'] },
  { label: 'Offertes', href: '/dashboard/quotes', requiredPermissions: ['ViewMyQuotes', 'ViewOthersQuotes'] },
  { label: 'Goedkeuringen', href: '/dashboard/approval-flows', requiredPermissions: ['UpdateApprovalFlowStatuses'] },
  { label: 'Goedkeuringsregels', href: '/dashboard/approval-rules', requiredPermissions: ['CreateApprovalRules', 'UpdateApprovalRules'] },
  { label: 'Project lijsten', href: '/dashboard/purchase-lists', requiredPermissions: ['ViewMyShoppingLists', 'ViewOthersShoppingLists'] },
  { label: 'Projecten', href: '/dashboard/projecten', requiredPermissions: ['ViewMyShoppingLists', 'ViewOthersShoppingLists'] },
  { label: 'Herhaal bestellingen', href: '/dashboard/recurring-orders' },
  { label: 'Bedrijfs gegevens', href: '/dashboard/company', requiredPermissions: ['UpdateBusinessUnitDetails'] },
  { label: 'Medewerkers', href: '/dashboard/company/associates', requiredPermissions: ['UpdateAssociates'] },
  { label: 'Adressen', href: '/dashboard/company/addresses' },
  { label: 'Mijn adres', href: '/dashboard/addresses' },
  { label: 'Mijn Profiel', href: '/dashboard/settings' },
  { label: 'Gegevens', href: '/account' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { hasAnyPermission } = usePermissions();
  const { localePath } = useLocale();

  return (
    <nav className="w-full space-y-1">
      {NAV_ITEMS.map((item) => {
        if (item.requiredPermissions && !hasAnyPermission(item.requiredPermissions)) {
          return null;
        }

        const localHref = localePath(item.href);
        const isActive =
          item.href === '/dashboard'
            ? pathname === localHref
            : pathname.startsWith(localHref);

        return (
          <Link
            key={item.href}
            href={localHref}
            className={classNames(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-light text-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
