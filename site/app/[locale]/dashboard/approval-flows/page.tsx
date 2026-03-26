'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { useApprovalFlows } from '@/hooks/useApprovalFlows';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { formatDate } from '@/lib/utils';

const LIMIT = 20;

const statusVariant: Record<string, 'warning' | 'success' | 'error' | 'neutral'> = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error',
};

export default function ApprovalFlowsPage() {
  const router = useRouter();
  const { localePath } = useLocale();
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useApprovalFlows(offset, statusFilter);
  const flows = data?.results ?? [];
  const total = data?.total ?? 0;

  const columns = [
    { key: 'order', header: 'Order', render: (row: any) => row.order?.orderNumber ?? row.order?.id?.slice(0, 8) ?? '-' },
    { key: 'status', header: 'Status', render: (row: any) => <Badge variant={statusVariant[row.status] ?? 'neutral'}>{row.status}</Badge> },
    { key: 'rules', header: 'Rules', render: (row: any) => row.rules?.length ?? 0 },
    { key: 'createdAt', header: 'Created', render: (row: any) => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Approval Flows</h1>

      <div className="mb-4 max-w-xs">
        <Select
          label="Filter by Status"
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Rejected', label: 'Rejected' },
          ]}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setOffset(0);
          }}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <Table columns={columns} data={flows} loading={isLoading} emptyMessage="No approval flows found." onRowClick={(row: any) => router.push(localePath(`/dashboard/approval-flows/${row.id}`))} />
        {total > LIMIT && (
          <div className="mt-6">
            <Pagination total={total} limit={LIMIT} offset={offset} onChange={setOffset} />
          </div>
        )}
      </div>
    </div>
  );
}
