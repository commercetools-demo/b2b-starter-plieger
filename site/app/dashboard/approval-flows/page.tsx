'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  const [flows, setFlows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFlows = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('limit', String(LIMIT));
    params.set('offset', String(offset));
    if (statusFilter) params.set('status', statusFilter);
    try {
      const res = await fetch(`/api/approval-flows?${params}`);
      const data = await res.json();
      setFlows(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setFlows([]);
    } finally {
      setLoading(false);
    }
  }, [offset, statusFilter]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

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
        <Table columns={columns} data={flows} loading={loading} emptyMessage="No approval flows found." onRowClick={(row: any) => router.push(`/dashboard/approval-flows/${row.id}`)} />
        {total > LIMIT && (
          <div className="mt-6">
            <Pagination total={total} limit={LIMIT} offset={offset} onChange={setOffset} />
          </div>
        )}
      </div>
    </div>
  );
}
