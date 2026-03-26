'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { useOrders } from '@/hooks/useOrders';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { OrderStatus } from '@/components/orders/OrderStatus';
import { formatMoney, formatDateTime } from '@/lib/utils';

const LIMIT = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Open', label: 'Open' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Complete', label: 'Complete' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const router = useRouter();
  const { localePath } = useLocale();
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useOrders(offset, statusFilter, LIMIT);
  const orders = data?.results ?? [];
  const total = data?.total ?? 0;

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setOffset(0);
  };

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (row: any) => row.orderNumber ?? row.id.slice(0, 8),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row: any) => formatDateTime(row.createdAt),
    },
    {
      key: 'orderState',
      header: 'Status',
      render: (row: any) => <OrderStatus state={row.orderState} />,
    },
    {
      key: 'totalPrice',
      header: 'Total',
      render: (row: any) => formatMoney(row.taxedPrice?.totalGross ?? row.totalPrice),
    },
    {
      key: 'lineItems',
      header: 'Items',
      render: (row: any) => row.lineItems?.length ?? 0,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <Table
          columns={columns}
          data={orders}
          loading={isLoading}
          emptyMessage="No orders found."
          onRowClick={(row: any) => router.push(localePath(`/dashboard/orders/${row.id}`))}
        />
        {total > LIMIT && (
          <div className="mt-6">
            <Pagination total={total} limit={LIMIT} offset={offset} onChange={setOffset} />
          </div>
        )}
      </div>
    </div>
  );
}
