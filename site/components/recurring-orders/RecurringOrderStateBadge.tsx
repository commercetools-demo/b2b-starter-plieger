import type { RecurringOrderState } from '@/lib/types';

const STATE_STYLES: Record<RecurringOrderState, string> = {
  Active: 'bg-green-100 text-green-700',
  Paused: 'bg-yellow-100 text-yellow-700',
  Canceled: 'bg-red-100 text-red-700',
  Expired: 'bg-slate-100 text-slate-600',
};

export function RecurringOrderStateBadge({ state }: { state: RecurringOrderState }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATE_STYLES[state] ?? 'bg-slate-100 text-slate-600'}`}>
      {state}
    </span>
  );
}
