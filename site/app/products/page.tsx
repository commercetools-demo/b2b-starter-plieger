'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { localizedString } from '@/lib/utils';

const LIMIT = 20;

interface Category {
  id: string;
  name: Record<string, string>;
  slug: Record<string, string>;
  parent?: { id: string };
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? '');
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('limit', String(LIMIT));
    params.set('offset', String(offset));
    if (search) params.set('q', search);
    if (selectedCategory) params.set('category', selectedCategory);
    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [offset, search, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? data.results ?? []))
      .catch(() => {});
  }, []);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.push(`/products?${params}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: search, offset: '' });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Categories</h2>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateParams({ category: '', offset: '' })}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${!selectedCategory ? 'bg-primary-light text-primary font-medium' : 'hover:bg-gray-100'}`}
              >
                All Products
              </button>
            </li>
            {categories.filter((cat) => !cat.parent).map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => updateParams({ category: cat.id, offset: '' })}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${selectedCategory === cat.id ? 'bg-primary-light text-primary font-medium' : 'hover:bg-gray-100'}`}
                >
                  {localizedString(cat.name) || cat.id}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <div className="flex-1">
              <Input
                name="search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
              />
            </div>
            <Button variant="primary">Search</Button>
          </form>

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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-10"><div className="animate-pulse h-8 bg-gray-200 rounded w-1/4 mb-8" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
