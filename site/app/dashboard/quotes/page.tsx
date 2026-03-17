'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { QuoteStatus } from '@/components/quotes/QuoteStatus';
import { formatMoney, formatDateTime } from '@/lib/utils';

const LIMIT = 20;

export default function QuotesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'quotes' | 'requests'>('quotes');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [quotesTotal, setQuotesTotal] = useState(0);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [quotesOffset, setQuotesOffset] = useState(0);
  const [requestsOffset, setRequestsOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes?limit=${LIMIT}&offset=${quotesOffset}`);
      const data = await res.json();
      setQuotes(data.results ?? []);
      setQuotesTotal(data.total ?? 0);
    } catch {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [quotesOffset]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quote-requests?limit=${LIMIT}&offset=${requestsOffset}`);
      const data = await res.json();
      setQuoteRequests(data.results ?? []);
      setRequestsTotal(data.total ?? 0);
    } catch {
      setQuoteRequests([]);
    } finally {
      setLoading(false);
    }
  }, [requestsOffset]);

  useEffect(() => {
    if (activeTab === 'quotes') fetchQuotes();
    else fetchRequests();
  }, [activeTab, fetchQuotes, fetchRequests]);

  const quoteColumns = [
    { key: 'id', header: 'Quote ID', render: (row: any) => row.id.slice(0, 8) },
    { key: 'createdAt', header: 'Date', render: (row: any) => formatDateTime(row.createdAt) },
    { key: 'quoteState', header: 'Status', render: (row: any) => <QuoteStatus state={row.quoteState} /> },
    { key: 'totalPrice', header: 'Total', render: (row: any) => formatMoney(row.totalPrice) },
  ];

  const requestColumns = [
    { key: 'id', header: 'Request ID', render: (row: any) => row.id.slice(0, 8) },
    { key: 'createdAt', header: 'Date', render: (row: any) => formatDateTime(row.createdAt) },
    { key: 'quoteRequestState', header: 'Status', render: (row: any) => <QuoteStatus state={row.quoteRequestState} /> },
    { key: 'totalPrice', header: 'Total', render: (row: any) => formatMoney(row.totalPrice) },
  ];

  const tabs = [
    { key: 'quotes' as const, label: 'Quotes' },
    { key: 'requests' as const, label: 'Quote Requests' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quotes</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {activeTab === 'quotes' ? (
          <>
            <Table columns={quoteColumns} data={quotes} loading={loading} emptyMessage="No quotes found." onRowClick={(row: any) => router.push(`/dashboard/quotes/${row.id}`)} />
            {quotesTotal > LIMIT && (
              <div className="mt-6">
                <Pagination total={quotesTotal} limit={LIMIT} offset={quotesOffset} onChange={setQuotesOffset} />
              </div>
            )}
          </>
        ) : (
          <>
            <Table columns={requestColumns} data={quoteRequests} loading={loading} emptyMessage="No quote requests found." onRowClick={(row: any) => router.push(`/dashboard/quotes/requests/${row.id}`)} />
            {requestsTotal > LIMIT && (
              <div className="mt-6">
                <Pagination total={requestsTotal} limit={LIMIT} offset={requestsOffset} onChange={setRequestsOffset} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
