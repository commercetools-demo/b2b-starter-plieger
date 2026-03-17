'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from '@/components/product/ProductGrid';

const features = [
  { icon: '🏗️', title: 'Business Units', description: 'Manage your divisions, regions, and job sites with hierarchical business units.' },
  { icon: '📝', title: 'Quotes', description: 'Request volume pricing and negotiate quotes with your sales rep for fleet orders.' },
  { icon: '✅', title: 'Approval Workflows', description: 'Build approval rules with a visual predicate builder — set spending limits, line item thresholds, and multi-tier approval chains.' },
  { icon: '📋', title: 'Purchase Lists', description: 'Save frequently ordered parts and equipment for fast reordering across projects.' },
];

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      fetch('/api/products?limit=8')
        .then((res) => res.json())
        .then((data) => setProducts(data.results ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isLoggedIn]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="mx-auto max-w-6xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                <span className="text-amber-400">Atlas</span> Construction<br />Equipment
              </h1>
              <p className="mt-6 text-lg text-slate-400 max-w-lg">
                Heavy machinery and equipment procurement — powered by commercetools.
                Manage your fleet orders with business units, quotes, and approval workflows.
              </p>
              <div className="mt-8 flex items-center gap-4">
                {!isLoggedIn ? (
                  <>
                    <Button variant="secondary" size="lg" href="/login">Sign In</Button>
                    <Button variant="ghost" size="lg" href="/register" className="text-white border-slate-500 hover:bg-white/10">
                      Create Account
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" size="lg" href="/products">Browse Products</Button>
                    <Button variant="ghost" size="lg" href="/dashboard" className="text-white border-slate-500 hover:bg-white/10">
                      Go to Dashboard
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <img src="/hero-excavator.webp" alt="Excavator" className="rounded-xl shadow-lg w-full h-48 object-cover" />
              <img src="/hero-crane.webp" alt="Crane" className="rounded-xl shadow-lg w-full h-48 object-cover" />
              <img src="/hero-bg.webp" alt="Bulldozer" className="rounded-xl shadow-lg w-full h-48 object-cover col-span-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Built for B2B</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover-lift">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {isLoggedIn && (
        <section className="py-16 px-6 bg-surface-dark">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Button variant="ghost" href="/products">View All</Button>
            </div>
            <ProductGrid products={products} loading={loading} />
          </div>
        </section>
      )}

      {/* Quick Links */}
      {isLoggedIn && (
        <section className="py-16 px-6">
          <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Orders', href: '/dashboard/orders' },
              { label: 'Quotes', href: '/dashboard/quotes' },
              { label: 'Purchase Lists', href: '/dashboard/purchase-lists' },
              { label: 'Company', href: '/dashboard/company' },
            ].map((link) => (
              <Button key={link.href} variant="secondary" href={link.href} className="w-full">
                {link.label}
              </Button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
