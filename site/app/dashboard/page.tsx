'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { OrderStatus } from '@/components/orders/OrderStatus';
import { formatMoney, formatDateTime } from '@/lib/utils';

interface Stats {
  recentOrders: number;
  pendingQuotes: number;
  pendingApprovals: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentBusinessUnit } = useBusinessUnit();
  const { can, hasAnyPermission } = usePermissions();
  const [stats, setStats] = useState<Stats>({ recentOrders: 0, pendingQuotes: 0, pendingApprovals: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBusinessUnit) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, quotesRes, approvalsRes] = await Promise.all([
          fetch('/api/orders?limit=5').then((r) => r.json()),
          fetch('/api/quotes?limit=1').then((r) => r.json()),
          fetch('/api/approval-flows?status=Pending&limit=1').then((r) => r.json()),
        ]);
        setRecentOrders(ordersRes.results ?? []);
        setStats({
          recentOrders: ordersRes.total ?? 0,
          pendingQuotes: quotesRes.total ?? 0,
          pendingApprovals: approvalsRes.total ?? 0,
        });
      } catch {
        // Silently fail; empty data displayed
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentBusinessUnit]);

  const canViewOrders = hasAnyPermission(['ViewMyOrders', 'ViewOthersOrders']);
  const canViewQuotes = hasAnyPermission(['ViewMyQuotes', 'ViewOthersQuotes']);
  const canViewApprovals = can('UpdateApprovalFlowStatuses');
  const canCreateOrders = hasAnyPermission(['CreateMyOrdersFromMyCarts', 'CreateOrdersFromOthersCarts']);
  const canCreateQuotes = hasAnyPermission(['CreateMyQuoteRequestsFromMyCarts', 'CreateQuoteRequestsFromOthersCarts']);
  const canViewPurchaseLists = hasAnyPermission(['ViewMyShoppingLists', 'ViewOthersShoppingLists']);

  const statCards = [
    { label: 'Total Orders', value: stats.recentOrders, href: '/dashboard/orders', enabled: canViewOrders },
    { label: 'Pending Quotes', value: stats.pendingQuotes, href: '/dashboard/quotes', enabled: canViewQuotes },
    { label: 'Pending Approvals', value: stats.pendingApprovals, href: '/dashboard/approval-flows', enabled: canViewApprovals },
  ];

  const orderColumns = [
    { key: 'orderNumber', header: 'Order #', render: (row: any) => row.orderNumber ?? row.id.slice(0, 8) },
    { key: 'createdAt', header: 'Date', render: (row: any) => formatDateTime(row.createdAt) },
    { key: 'orderState', header: 'Status', render: (row: any) => <OrderStatus state={row.orderState} /> },
    { key: 'totalPrice', header: 'Total', render: (row: any) => formatMoney(row.taxedPrice?.totalGross ?? row.totalPrice) },
    { key: 'lineItems', header: 'Items', render: (row: any) => row.lineItems?.length ?? 0 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName ?? 'there'}
        </h1>
        {currentBusinessUnit && (
          <p className="text-gray-600 mt-1">{currentBusinessUnit.name}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) =>
          card.enabled ? (
            <a
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-primary/30 transition-colors"
            >
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{loading ? '...' : card.value}</p>
            </a>
          ) : (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-100 p-5 opacity-50 cursor-not-allowed"
            >
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{loading ? '...' : card.value}</p>
              <div className="flex justify-end mt-1"><svg aria-label="Insufficient permissions to perform this task" role="img" className="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></div>
            </div>
          )
        )}
      </div>

      {/* Recent Orders */}
      {canViewOrders && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Button variant="ghost" size="sm" href="/dashboard/orders">View All</Button>
          </div>
          <Table
            columns={orderColumns}
            data={recentOrders}
            loading={loading}
            emptyMessage="No orders yet."
            onRowClick={(row: any) => router.push(`/dashboard/orders/${row.id}`)}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {canCreateOrders ? (
          <Button variant="primary" href="/products">New Order</Button>
        ) : (
          <div className="inline-flex flex-col items-center">
            <Button variant="primary" disabled>New Order</Button>
            <svg aria-label="Insufficient permissions to perform this task" role="img" className="h-4 w-4 text-red-400 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
        )}
        {canCreateQuotes ? (
          <Button variant="secondary" href="/cart">Request Quote</Button>
        ) : (
          <div className="inline-flex flex-col items-center">
            <Button variant="secondary" disabled>Request Quote</Button>
            <svg aria-label="Insufficient permissions to perform this task" role="img" className="h-4 w-4 text-red-400 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
        )}
        {canViewPurchaseLists ? (
          <Button variant="secondary" href="/dashboard/purchase-lists">Purchase Lists</Button>
        ) : (
          <div className="inline-flex flex-col items-center">
            <Button variant="secondary" disabled>Purchase Lists</Button>
            <svg aria-label="Insufficient permissions to perform this task" role="img" className="h-4 w-4 text-red-400 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
        )}
      </div>
    </div>
  );
}
