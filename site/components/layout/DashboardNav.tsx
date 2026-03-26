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
  { label: 'Overview', href: '/dashboard' },
  { label: 'Orders', href: '/dashboard/orders', requiredPermissions: ['ViewMyOrders', 'ViewOthersOrders'] },
  { label: 'Quotes', href: '/dashboard/quotes', requiredPermissions: ['ViewMyQuotes', 'ViewOthersQuotes'] },
  { label: 'Approval Flows', href: '/dashboard/approval-flows', requiredPermissions: ['UpdateApprovalFlowStatuses'] },
  { label: 'Approval Rules', href: '/dashboard/approval-rules', requiredPermissions: ['CreateApprovalRules', 'UpdateApprovalRules'] },
  { label: 'Purchase Lists', href: '/dashboard/purchase-lists', requiredPermissions: ['ViewMyShoppingLists', 'ViewOthersShoppingLists'] },
  { label: 'Recurring Orders', href: '/dashboard/recurring-orders' },
  { label: 'Company Admin', href: '/dashboard/company', requiredPermissions: ['UpdateBusinessUnitDetails'] },
  { label: 'Associates', href: '/dashboard/company/associates', requiredPermissions: ['UpdateAssociates'] },
  { label: 'Addresses', href: '/dashboard/company/addresses' },
  { label: 'My Addresses', href: '/dashboard/addresses' },
  { label: 'My Profile', href: '/dashboard/settings' },
  { label: 'Account', href: '/account' },
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
                ? 'bg-red-50 text-red-700'
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
