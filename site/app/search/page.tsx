import { Suspense } from 'react';
import { SearchResultsView } from '@/components/search/SearchResultsView';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-10 text-sm text-gray-500">Loading…</div>}>
      <SearchResultsView query={q} />
    </Suspense>
  );
}
