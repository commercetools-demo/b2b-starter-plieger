'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from '@/components/product/ProductGrid';

const features = [
  { icon: '🏗️', title: 'Bedrijfsonderdelen', description: 'Beheer uw divisies, regio\'s en projectlocaties met hiërarchische bedrijfsonderdelen.' },
  { icon: '📝', title: 'Offertes', description: 'Vraag volumeprijzen aan en onderhandel offertes met uw verkoopvertegenwoordiger voor vlootbestellingen.' },
  { icon: '✅', title: 'Goedkeuringswerkstroom', description: 'Bouw goedkeuringsregels met een visuele predicaatbouwer — stel uitgavenlimietenen regelitemdrempels in en multi-tier goedkeuringsketen.' },
  { icon: '📋', title: 'Inkooplijsten', description: 'Sla regelmatig bestelde onderdelen en apparatuur op voor snel hertellen in projecten.' },
];

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const { localePath } = useLocale();
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
      <section className="bg-white text-black py-20 px-6 relative overflow-hidden">
        <div className="mx-auto max-w-6xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                <span className="text-primary">Plieger</span> Sanitair<br />en installatie materiaal
              </h1>
              <p className="mt-6 text-lg text-slate-400 max-w-lg">
                Plieger levert, een digitaal platform voor efficiënt voorraadbeheer en geautomatiseerd bestellen
              </p>
              <div className="mt-8 flex items-center gap-4">
                {!isLoggedIn ? (
                  <>
                    <Button variant="secondary" size="lg" href={localePath('/login')}>Log In</Button>
                    <Button variant="ghost" size="lg" href={localePath('/register')} className="text-white border-slate-500 hover:bg-white/10">
                      Create Account
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" size="lg" href={localePath('/products')}>Producten</Button>
                    <Button variant="ghost" size="lg" href={localePath('/dashboard')} className="text-white border-slate-500 hover:bg-white/10">
                      Go to Dashboard
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <img src="/warmtepompen.png" alt="Warmtepomp" className="rounded-xl shadow-lg w-full h-48 object-cover" />
              <img src="/Maart-deals-4.png" alt="Crane" className="rounded-xl shadow-lg w-full h-48 object-cover" />
              <img src="/Online-only-2.png" alt="Bulldozer" className="rounded-xl shadow-lg w-full h-64 object-cover col-span-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Gemaakt for B2B</h2>
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
              <h2 className="text-2xl font-bold">Producten</h2>
              <Button variant="ghost" href={localePath('/products')}>Bekijk alle</Button>
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
              { label: 'Bestellingen', href: '/dashboard/orders' },
              { label: 'Offertes', href: '/dashboard/quotes' },
              { label: 'Project lijsten', href: '/dashboard/purchase-lists' },
              { label: 'Uw bedrijf', href: '/dashboard/company' },
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
