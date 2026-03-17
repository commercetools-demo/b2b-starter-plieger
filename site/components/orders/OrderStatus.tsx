import { Badge } from '@/components/ui/Badge';
import type { OrderState } from '@/lib/types';
import type { BadgeProps } from '@/components/ui/Badge';

const stateMap: Record<OrderState, { variant: BadgeProps['variant']; label: string }> = {
  Open: { variant: 'info', label: 'Open' },
  Confirmed: { variant: 'warning', label: 'Confirmed' },
  Complete: { variant: 'success', label: 'Complete' },
  Cancelled: { variant: 'error', label: 'Cancelled' },
};

export interface OrderStatusProps {
  state: OrderState;
}

export function OrderStatus({ state }: OrderStatusProps) {
  const config = stateMap[state] ?? { variant: 'neutral' as const, label: state };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
