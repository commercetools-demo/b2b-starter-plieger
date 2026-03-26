'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { RecurringOrderStateBadge } from './RecurringOrderStateBadge';
import { formatMoney, formatDate, localizedString } from '@/lib/utils';
import { useRecurringOrderActions } from '@/hooks/useRecurringOrders';
import type { RecurringOrder } from '@/lib/types';
import { useLocale } from '@/context/LocaleContext';

interface RecurringOrderDetailProps {
  order: RecurringOrder & { id: string };
}

export function RecurringOrderDetail({ order }: RecurringOrderDetailProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const { pauseOrder, resumeOrder, cancelOrder, duplicateOrder } = useRecurringOrderActions();
  const { localePath } = useLocale();

  const doAction = async (action: 'pause' | 'resume' | 'cancel' | 'duplicate') => {
    const fn = { pause: pauseOrder, resume: resumeOrder, cancel: cancelOrder, duplicate: duplicateOrder }[action];
    try {
      await fn(order.id);
      addToast(action === 'duplicate' ? 'Recurring order duplicated' : `Order ${action}d`);
      if (action === 'duplicate') {
        router.push(localePath('/dashboard/recurring-orders'));
      }
    } catch (err: any) {
      addToast(err?.message ?? `Failed to ${action}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RecurringOrderStateBadge state={order.state} />
          <span className="text-sm text-slate-500">Created {formatDate(order.createdAt)}</span>
        </div>
        <div className="flex gap-2">
          {order.state === 'Active' && (
            <Button variant="secondary" size="sm" onClick={() => doAction('pause')}>Pause</Button>
          )}
          {order.state === 'Paused' && (
            <Button variant="secondary" size="sm" onClick={() => doAction('resume')}>Resume</Button>
          )}
          {(order.state === 'Active' || order.state === 'Paused') && (
            <Button variant="secondary" size="sm" onClick={() => doAction('cancel')}>Cancel</Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => doAction('duplicate')}>Duplicate</Button>
        </div>
      </div>

      {/* Schedule info */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500 mb-1">Schedule</p>
          <p className="text-sm font-medium">Every {order.schedule.value} {order.schedule.intervalUnit}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500 mb-1">Next Order</p>
          <p className="text-sm font-medium">{order.nextOrderAt ? formatDate(order.nextOrderAt) : '—'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500 mb-1">Last Order</p>
          <p className="text-sm font-medium">{order.lastOrderAt ? formatDate(order.lastOrderAt) : '—'}</p>
        </div>
        {order.resumesAt && (
          <div className="rounded-lg bg-yellow-50 p-3">
            <p className="text-xs text-yellow-600 mb-1">Resumes</p>
            <p className="text-sm font-medium text-yellow-700">{formatDate(order.resumesAt)}</p>
          </div>
        )}
      </div>

      {/* Origin order snapshot */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Order Items</h3>
        <div className="space-y-2 mb-4">
          {(order.orderSnapshot?.lineItems ?? []).map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-slate-100 last:border-0">
              <p className="text-slate-800">{localizedString(item.name)}</p>
              <p className="text-slate-600">×{item.quantity}</p>
            </div>
          ))}
        </div>
        {order.orderSnapshot?.totalPrice && (
          <div className="flex justify-between items-center border-t border-slate-200 pt-3">
            <span className="font-medium text-slate-700">Total</span>
            <span className="font-bold">{formatMoney(order.orderSnapshot.totalPrice)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
