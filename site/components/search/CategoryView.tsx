'use client';

import { useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/ui/Pagination';
import { FacetSidebar } from './FacetSidebar';
import { SortSelect } from './SortSelect';

const LIMIT = 20;

interface CategoryViewProps {
  categoryId: string;
  categoryName: string;
}

function CategoryViewContent({ categoryId, categoryName }: CategoryViewProps) {
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

  const body = useMemo(() => {
    const filters = Object.entries(selectedFilters)
      .filter(([, vals]) => vals.length > 0)
      .map(([k, vals]) => ({ identifier: k, type: 'term', terms: vals }));

    const b: Record<string, unknown> = {
      limit: LIMIT,
      cursor: `offset:${offset}`,
      categories: [categoryId],
    };
    if (filters.length) b.filters = filters;
    if (sort && sort !== 'score') {
      const [field, order] = sort.split('-');
      if (field) b.sortAttributes = { [field]: order === 'desc' ? 'desc' : 'asc' };
    }
    return b;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, offset, sort, searchParams.toString()]);

  const { data, isLoading } = useProducts(body);
  const products = data?.results ?? [];
  const total = data?.total ?? 0;
  const facets = data?.facets ?? [];

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (facetName: string, value: string, checked: boolean) => {
    const current = selectedFilters[facetName] ?? [];
    const next = checked ? [...current, value] : current.filter((v) => v !== value);
    updateParams({ [`filter.${facetName}`]: next.join(','), offset: '' });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">{categoryName}</h1>
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
          <ProductGrid products={products} loading={isLoading} />
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

export function CategoryView(props: CategoryViewProps) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-10"><div className="animate-pulse h-8 bg-gray-200 rounded w-1/4 mb-8" /></div>}>
      <CategoryViewContent {...props} />
    </Suspense>
  );
}
