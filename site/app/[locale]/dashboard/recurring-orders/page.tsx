'use client';

import { useToast } from '@/context/ToastContext';
import { RecurringOrdersTable } from '@/components/recurring-orders/RecurringOrdersTable';
import { useRecurringOrders, useRecurringOrderActions } from '@/hooks/useRecurringOrders';

export default function RecurringOrdersPage() {
  const { addToast } = useToast();
  const { data, isLoading } = useRecurringOrders();
  const { pauseOrder, resumeOrder, cancelOrder, duplicateOrder } = useRecurringOrderActions();

  const handleAction = async (id: string, action: 'pause' | 'resume' | 'cancel' | 'duplicate') => {
    const fn = { pause: pauseOrder, resume: resumeOrder, cancel: cancelOrder, duplicate: duplicateOrder }[action];
    try {
      await fn(id);
      addToast(action === 'duplicate' ? 'Recurring order duplicated' : `Order ${action}d`);
    } catch (err: any) {
      addToast(err?.message ?? `Failed to ${action}`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Herhaal bestellingen</h1>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-200 rounded" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200">
          <RecurringOrdersTable
            orders={data?.results ?? []}
            onPause={(id) => handleAction(id, 'pause')}
            onResume={(id) => handleAction(id, 'resume')}
            onCancel={(id) => handleAction(id, 'cancel')}
            onDuplicate={(id) => handleAction(id, 'duplicate')}
          />
        </div>
      )}
    </div>
  );
}
