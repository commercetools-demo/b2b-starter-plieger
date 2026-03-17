import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import type { BusinessUnit } from '@/lib/types';

export interface BusinessUnitCardProps {
  businessUnit: BusinessUnit;
}

export function BusinessUnitCard({ businessUnit }: BusinessUnitCardProps) {
  const statusVariant = businessUnit.status === 'Active' ? 'success' : 'neutral';

  return (
    <Link
      href={`/dashboard/company/${businessUnit.key}`}
      className="block rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {businessUnit.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Key: {businessUnit.key}
          </p>
        </div>
        <Badge variant={statusVariant}>{businessUnit.status}</Badge>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
        <span className="flex items-center gap-1">
          <span className="font-medium">{businessUnit.unitType}</span>
        </span>
        <span className="text-slate-300">|</span>
        <span>
          {businessUnit.stores.length}{' '}
          {businessUnit.stores.length === 1 ? 'store' : 'stores'}
        </span>
        <span className="text-slate-300">|</span>
        <span>
          {businessUnit.associates.length}{' '}
          {businessUnit.associates.length === 1 ? 'associate' : 'associates'}
        </span>
      </div>
    </Link>
  );
}
