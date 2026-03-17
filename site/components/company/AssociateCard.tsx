import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Associate } from '@/lib/types';

export interface AssociateCardProps {
  associate: Associate;
  onEditRoles?: (associate: Associate) => void;
  onRemove?: (associate: Associate) => void;
  readonly?: boolean;
}

export function AssociateCard({
  associate,
  onEditRoles,
  onRemove,
  readonly = false,
}: AssociateCardProps) {
  const { customer, associateRoleAssignments } = associate;
  const fullName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-600">
          {customer.firstName?.[0]?.toUpperCase() ??
            customer.email?.[0]?.toUpperCase() ??
            '?'}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-medium text-slate-900">
            {fullName || 'Unnamed Associate'}
          </p>
          {customer.email && (
            <p className="text-xs text-slate-500">{customer.email}</p>
          )}
          {/* Roles */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {associateRoleAssignments.map((assignment) => (
              <Badge key={assignment.associateRole.key} variant="info">
                {assignment.associateRole.key}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      {!readonly && (onEditRoles || onRemove) && (
        <div className="flex items-center gap-2">
          {onEditRoles && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditRoles(associate)}
            >
              Edit Roles
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(associate)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Remove
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
