'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/context/LocaleContext';
import { RecurringOrderDetail } from '@/components/recurring-orders/RecurringOrderDetail';
import { useRecurringOrder } from '@/hooks/useRecurringOrders';

export default function RecurringOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { localePath } = useLocale();
  const { data: order, isLoading } = useRecurringOrder(id);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500 mb-4">Recurring order not found.</p>
        <Button variant="secondary" href={localePath('/dashboard/recurring-orders')}>← Back</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" href={localePath('/dashboard/recurring-orders')} size="sm">← Back</Button>
        <h1 className="text-xl font-bold">Recurring Order</h1>
      </div>
      <RecurringOrderDetail order={order} />
    </div>
  );
}
