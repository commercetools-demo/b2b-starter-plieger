'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/ui/Pagination';
import { FacetSidebar } from './FacetSidebar';
import { SortSelect } from './SortSelect';

const LIMIT = 20;

function SearchResultsContent({ query }: { query: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const offset = parseInt(searchParams.get('offset') ?? '0', 10);
  const sort = searchParams.get('sort') ?? 'score';

  const selectedFilters: Record<string, string[]> = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith('filter.')) {
      selectedFilters[key.slice(7)] = value.split(',').filter(Boolean);
    }
  });

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('limit', String(LIMIT));
    params.set('offset', String(offset));
    if (query) params.set('q', query);
    if (sort && sort !== 'score') params.set('sort', sort);

    Object.entries(selectedFilters).forEach(([k, vals]) => {
      if (vals.length > 0) params.set(`filter.${k}`, vals.join(','));
    });

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.results ?? []);
      setTotal(data.total ?? 0);
      setFacets(data.facets ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, offset, sort, searchParams.toString()]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleFilterChange = (facetName: string, value: string, checked: boolean) => {
    const current = selectedFilters[facetName] ?? [];
    const next = checked ? [...current, value] : current.filter((v) => v !== value);
    updateParams({ [`filter.${facetName}`]: next.join(','), offset: '' });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      {query && (
        <p className="text-gray-500 mb-8 text-sm">
          Results for &ldquo;<span className="font-medium text-gray-800">{query}</span>&rdquo;
        </p>
      )}
      <div className="flex gap-8">
        <FacetSidebar
          facets={facets}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">{total} products</p>
            <SortSelect value={sort} onChange={(s) => updateParams({ sort: s, offset: '' })} />
          </div>
          {!loading && total === 0 && (
            <div className="text-center py-16 text-gray-500">
              No products found{query ? ` for "${query}"` : ''}.
            </div>
          )}
          <ProductGrid products={products} loading={loading} />
          {total > LIMIT && (
            <div className="mt-8">
              <Pagination
                total={total}
                limit={LIMIT}
                offset={offset}
                onChange={(newOffset) => updateParams({ offset: String(newOffset) })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SearchResultsView({ query }: { query: string }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-10"><div className="animate-pulse h-8 bg-gray-200 rounded w-1/4 mb-8" /></div>}>
      <SearchResultsContent query={query} />
    </Suspense>
  );
}
