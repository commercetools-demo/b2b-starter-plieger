'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatMoney, formatDate, localizedString } from '@/lib/utils';
import { RecurringOrderStateBadge } from './RecurringOrderStateBadge';
import type { RecurringOrder } from '@/lib/types';

interface RecurringOrdersTableProps {
  orders: RecurringOrder[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function RecurringOrdersTable({
  orders,
  onPause,
  onResume,
  onCancel,
  onDuplicate,
}: RecurringOrdersTableProps) {
  const router = useRouter();

  if (orders.length === 0) {
    return <p className="text-sm text-slate-500 py-8 text-center">No recurring orders found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500">Order</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500">Schedule</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500">Next Order</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500">Total</th>
            <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
              onClick={() => router.push(`/dashboard/recurring-orders/${order.id}`)}
            >
              <td className="py-3 px-4">
                <RecurringOrderStateBadge state={order.state} />
              </td>
              <td className="py-3 px-4">
                <Link
                  href={`/dashboard/recurring-orders/${order.id}`}
                  className="font-medium text-slate-900 hover:text-red-600"
                >
                  {(order.originOrderId ?? order.id).slice(0, 8)}…
                </Link>
                <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
              </td>
              <td className="py-3 px-4 text-slate-700">
                Every {order.schedule.value} {order.schedule.intervalUnit}
              </td>
              <td className="py-3 px-4 text-slate-700">
                {order.nextOrderAt ? formatDate(order.nextOrderAt) : '—'}
                {order.state === 'Paused' && order.resumesAt && (
                  <p className="text-xs text-yellow-600">Resumes {formatDate(order.resumesAt)}</p>
                )}
              </td>
              <td className="py-3 px-4 font-medium">
                {order.orderSnapshot?.totalPrice ? formatMoney(order.orderSnapshot.totalPrice) : '—'}
              </td>
              <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  {order.state === 'Active' && (
                    <button
                      onClick={() => onPause(order.id)}
                      className="text-xs px-2 py-1 rounded border border-slate-200 hover:border-yellow-400 text-slate-600 hover:text-yellow-700"
                    >
                      Pause
                    </button>
                  )}
                  {order.state === 'Paused' && (
                    <button
                      onClick={() => onResume(order.id)}
                      className="text-xs px-2 py-1 rounded border border-slate-200 hover:border-green-400 text-slate-600 hover:text-green-700"
                    >
                      Resume
                    </button>
                  )}
                  {(order.state === 'Active' || order.state === 'Paused') && (
                    <button
                      onClick={() => onCancel(order.id)}
                      className="text-xs px-2 py-1 rounded border border-slate-200 hover:border-red-400 text-slate-600 hover:text-red-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => onDuplicate(order.id)}
                    className="text-xs px-2 py-1 rounded border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-700"
                  >
                    Duplicate
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
