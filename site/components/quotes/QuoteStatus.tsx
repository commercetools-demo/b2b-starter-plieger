import { Badge } from '@/components/ui/Badge';
import type { QuoteState } from '@/lib/types';
import type { BadgeProps } from '@/components/ui/Badge';

const stateMap: Record<QuoteState, { variant: BadgeProps['variant']; label: string }> = {
  Pending: { variant: 'warning', label: 'Pending' },
  DeclinedForRenegotiation: { variant: 'warning', label: 'Renegotiation' },
  RenegotiationAddressed: { variant: 'info', label: 'Renegotiation Addressed' },
  Accepted: { variant: 'success', label: 'Accepted' },
  Declined: { variant: 'error', label: 'Declined' },
  Withdrawn: { variant: 'neutral', label: 'Withdrawn' },
  Failed: { variant: 'error', label: 'Failed' },
};

export interface QuoteStatusProps {
  state: QuoteState;
}

export function QuoteStatus({ state }: QuoteStatusProps) {
  const config = stateMap[state] ?? { variant: 'neutral' as const, label: state };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
