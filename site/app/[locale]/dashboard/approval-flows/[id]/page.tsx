'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { useApprovalFlow, useApprovalFlowMutations } from '@/hooks/useApprovalFlows';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDate, formatDateTime, formatMoney } from '@/lib/utils';

const statusVariant: Record<string, 'warning' | 'success' | 'error' | 'neutral'> = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error',
};

export default function ApprovalFlowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { localePath } = useLocale();
  const { addToast } = useToast();
  const { data: flow, isLoading } = useApprovalFlow(id);
  const { performFlowAction } = useApprovalFlowMutations();

  const [actionLoading, setActionLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await performFlowAction(id, 'approve');
      addToast('Flow approved');
    } catch {
      addToast('Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await performFlowAction(id, 'reject', rejectReason);
      addToast('Flow rejected');
      setRejectOpen(false);
      setRejectReason('');
    } catch {
      addToast('Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-2">Approval Flow Not Found</h1>
        <Button variant="primary" href={localePath('/dashboard/approval-flows')}>Back to Flows</Button>
      </div>
    );
  }

  const approvalColumns = [
    { key: 'approver', header: 'Approver', render: (a: any) => a.approver?.name ?? a.approver?.email ?? '-' },
    { key: 'approvedAt', header: 'Date', render: (a: any) => formatDateTime(a.approvedAt) },
  ];

  const rejectionColumns = [
    { key: 'rejecter', header: 'Rejected By', render: (r: any) => r.rejecter?.name ?? r.rejecter?.email ?? '-' },
    { key: 'rejectedAt', header: 'Date', render: (r: any) => formatDateTime(r.rejectedAt) },
    { key: 'reason', header: 'Reason', render: (r: any) => r.reason ?? '-' },
  ];

  const isPending = flow.status === 'Pending';

  return (
    <div>
      <Button variant="ghost" size="sm" href={localePath('/dashboard/approval-flows')} className="mb-4">&larr; Back to Approval Flows</Button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Approval Flow</h1>
          <p className="text-gray-500 text-sm mt-1">Created {formatDate(flow.createdAt)}</p>
        </div>
        <Badge variant={statusVariant[flow.status] ?? 'neutral'}>{flow.status}</Badge>
      </div>

      {flow.order && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Linked Order</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Order #</dt>
              <dd className="font-medium">{flow.order.orderNumber ?? flow.order.id?.slice(0, 8)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Total</dt>
              <dd className="font-medium">{formatMoney(flow.order.totalPrice)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Items</dt>
              <dd className="font-medium">{flow.order.lineItems?.length ?? 0}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Date</dt>
              <dd className="font-medium">{formatDate(flow.order.createdAt)}</dd>
            </div>
          </dl>
        </div>
      )}

      {flow.rules?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Applicable Rules</h2>
          <ul className="space-y-2">
            {flow.rules.map((rule: any, i: number) => (
              <li key={i} className="text-sm p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{rule.name ?? `Rule ${i + 1}`}</span>
                {rule.description && <p className="text-gray-500 mt-1">{rule.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {flow.approvals?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Approvals</h2>
          <Table columns={approvalColumns} data={flow.approvals} loading={false} emptyMessage="" />
        </div>
      )}

      {flow.rejections?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Rejections</h2>
          <Table columns={rejectionColumns} data={flow.rejections} loading={false} emptyMessage="" />
        </div>
      )}

      {(flow.eligibleApprovers?.length > 0 || flow.pendingApprovers?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {flow.eligibleApprovers?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-3">Eligible Approvers</h2>
              <ul className="space-y-1 text-sm">
                {flow.eligibleApprovers.map((a: any, i: number) => (
                  <li key={i}>{a.name ?? a.email ?? `Approver ${i + 1}`}</li>
                ))}
              </ul>
            </div>
          )}
          {flow.pendingApprovers?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-3">Pending Approvers</h2>
              <ul className="space-y-1 text-sm">
                {flow.pendingApprovers.map((a: any, i: number) => (
                  <li key={i}>{a.name ?? a.email ?? `Approver ${i + 1}`}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {isPending && (
        <div className="flex gap-3">
          <Button variant="primary" loading={actionLoading} onClick={handleApprove}>Approve</Button>
          <Button variant="danger" onClick={() => setRejectOpen(true)}>Reject</Button>
        </div>
      )}

      <Modal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject Approval Flow"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleReject}>Reject</Button>
          </>
        }
      >
        <Input
          label="Reason for rejection"
          name="reason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Provide a reason..."
        />
      </Modal>
    </div>
  );
}
