'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { useQuotes, useQuoteRequests } from '@/hooks/useQuotes';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { QuoteStatus } from '@/components/quotes/QuoteStatus';
import { formatMoney, formatDateTime } from '@/lib/utils';

const LIMIT = 20;

export default function QuotesPage() {
  const router = useRouter();
  const { localePath } = useLocale();
  const [activeTab, setActiveTab] = useState<'quotes' | 'requests'>('quotes');
  const [quotesOffset, setQuotesOffset] = useState(0);
  const [requestsOffset, setRequestsOffset] = useState(0);

  const { data: quotesData, isLoading: quotesLoading } = useQuotes(quotesOffset);
  const { data: requestsData, isLoading: requestsLoading } = useQuoteRequests(requestsOffset);

  const quotes = quotesData?.results ?? [];
  const quoteRequests = requestsData?.results ?? [];
  const quotesTotal = quotesData?.total ?? 0;
  const requestsTotal = requestsData?.total ?? 0;

  const loading = activeTab === 'quotes' ? quotesLoading : requestsLoading;

  const quoteColumns = [
    { key: 'id', header: 'Offerte ID', render: (row: any) => row.id.slice(0, 8) },
    { key: 'createdAt', header: 'Datum', render: (row: any) => formatDateTime(row.createdAt) },
    { key: 'quoteState', header: 'Status', render: (row: any) => <QuoteStatus state={row.quoteState} /> },
    { key: 'totalPrice', header: 'Totaal', render: (row: any) => formatMoney(row.totalPrice) },
  ];

  const requestColumns = [
    { key: 'id', header: 'Aanvraag', render: (row: any) => row.id.slice(0, 8) },
    { key: 'createdAt', header: 'Datum', render: (row: any) => formatDateTime(row.createdAt) },
    { key: 'quoteRequestState', header: 'Status', render: (row: any) => <QuoteStatus state={row.quoteRequestState} /> },
    { key: 'totalPrice', header: 'Totaal', render: (row: any) => formatMoney(row.totalPrice) },
  ];

  const tabs = [
    { key: 'quotes' as const, label: 'Offertes' },
    { key: 'requests' as const, label: 'Offerte Aanvragen' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Offertes</h1>

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
            <Table columns={quoteColumns} data={quotes} loading={loading} emptyMessage="Geen offertes gevonden" onRowClick={(row: any) => router.push(localePath(`/dashboard/quotes/${row.id}`))} />
            {quotesTotal > LIMIT && (
              <div className="mt-6">
                <Pagination total={quotesTotal} limit={LIMIT} offset={quotesOffset} onChange={setQuotesOffset} />
              </div>
            )}
          </>
        ) : (
          <>
            <Table columns={requestColumns} data={quoteRequests} loading={loading} emptyMessage="Geen offerte aanvragen gevonden" onRowClick={(row: any) => router.push(localePath(`/dashboard/quotes/requests/${row.id}`))} />
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
