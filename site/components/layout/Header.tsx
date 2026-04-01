'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { useCart } from '@/context/CartContext';
import { MiniCart } from './MiniCart';
import { QuickOrder } from '@/components/order/QuickOrder';
import { usePermissions } from '@/hooks/usePermissions';
import { LanguageSelector } from './LanguageSelector';
import { useLocale } from '@/context/LocaleContext';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';

const ChevronDown = () => (
  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export function Header() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const {
    currentBusinessUnit,
    currentStore,
    businessUnits,
    selectBusinessUnit,
    selectStore,
  } = useBusinessUnit();
  const { itemCount, openMiniCart } = useCart();
  const { roleKeys } = usePermissions();
  const primaryRole = Array.from(roleKeys)[0];
  const { localePath } = useLocale();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [buMenuOpen, setBuMenuOpen] = useState(false);
  const [storeMenuOpen, setStoreMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { data: suggestions = [] } = useSearchSuggestions(search);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const buMenuRef = useRef<HTMLDivElement>(null);
  const storeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (buMenuRef.current && !buMenuRef.current.contains(e.target as Node)) {
        setBuMenuOpen(false);
      }
      if (storeMenuRef.current && !storeMenuRef.current.contains(e.target as Node)) {
        setStoreMenuOpen(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (search.trim()) {
      router.push(localePath(`/search?q=${encodeURIComponent(search.trim())}`));
    }
  };

  const hasMultipleBUs = businessUnits.length > 1;
  const stores = currentBusinessUnit?.stores ?? [];
  const hasMultipleStores = stores.length > 1;

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        {/* Context bar — show BU and store when logged in */}
        {isLoggedIn && currentBusinessUnit && (
          <div className="border-b border-primary bg-gradient-to-r from-primary-light to-slate-50">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1.5 text-xs sm:px-6 lg:px-8 ">
              {/* Business Unit: dropdown if multiple, label if single */}
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {hasMultipleBUs ? (
                  <div className="relative" ref={buMenuRef}>
                    <button
                      onClick={() => setBuMenuOpen(!buMenuOpen)}
                      className="flex items-center gap-1 font-medium text-slate-700 hover:text-red-600"
                    >
                      <span className="max-w-[200px] truncate">{currentBusinessUnit.name}</span>
                      <ChevronDown />
                    </button>
                    {buMenuOpen && (
                      <div className="absolute left-0 z-30 mt-1 w-64 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                        {businessUnits.map((bu) => (
                          <button
                            key={bu.id}
                            onClick={() => {
                              selectBusinessUnit(bu.id);
                              setBuMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            {bu.id === currentBusinessUnit.id ? (
                              <CheckIcon />
                            ) : (
                              <span className="w-4" />
                            )}
                            <span className={bu.id === currentBusinessUnit.id ? 'font-medium' : ''}>
                              {bu.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="font-medium text-slate-700">{currentBusinessUnit.name}</span>
                )}
              </div>

              <span className="text-slate-300">|</span>

              {/* Store: dropdown if multiple, label if single */}
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {hasMultipleStores ? (
                  <div className="relative" ref={storeMenuRef}>
                    <button
                      onClick={() => setStoreMenuOpen(!storeMenuOpen)}
                      className="flex items-center gap-1 font-medium text-slate-700 hover:text-red-600"
                    >
                      <span className="max-w-[200px] truncate">
                        {currentStore?.name || currentStore?.key || 'Select store'}
                      </span>
                      <ChevronDown />
                    </button>
                    {storeMenuOpen && (
                      <div className="absolute left-0 z-30 mt-1 w-64 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                        {stores.map((store) => (
                          <button
                            key={store.key}
                            onClick={() => {
                              selectStore(store.key);
                              setStoreMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            {store.key === currentStore?.key ? (
                              <CheckIcon />
                            ) : (
                              <span className="w-4" />
                            )}
                            <span className={store.key === currentStore?.key ? 'font-medium' : ''}>
                              {store.name || store.key}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : currentStore ? (
                  <span className="font-medium text-slate-700">
                    {currentStore.name || currentStore.key}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Main top bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">PLIEGER</span>
          </Link>

          {/* Search - hidden on mobile */}
          <form
            onSubmit={handleSearch}
            className="hidden flex-1 max-w-md mx-8 md:flex"
          >
            <div className="relative w-full" ref={suggestionsRef}>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Zoek producten..."
                className="w-full rounded-md border border-slate-300 py-2 pl-3 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && search.length >= 2 && (
                <div className="absolute left-0 right-0 top-full z-40 mt-1 rounded-md border border-slate-200 bg-white shadow-lg">
                  {suggestions.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50"
                    >
                      {s.image && (
                        <img src={s.image} alt="" className="h-8 w-8 rounded object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-slate-900">{s.name}</p>
                        {s.sku && <p className="text-xs text-slate-400">SKU: {s.sku}</p>}
                      </div>
                    </a>
                  ))}
                  <div className="border-t border-slate-100 px-3 py-2">
                    <button
                      type="submit"
                      className="text-xs text-red-600 hover:underline"
                    >
                      See all results for &ldquo;{search}&rdquo;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <LanguageSelector />
            {isLoggedIn ? (
              <>
                {/* Quick Order */}
                <QuickOrder />

                {/* Cart button */}
                <button
                  onClick={openMiniCart}
                  className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100"
                  aria-label="Open cart"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </button>

                {/* User menu */}
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-md p-2 text-slate-600 hover:bg-slate-100"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-600">
                      {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase()}
                    </div>
                    {primaryRole && (
                      <span className="text-xs font-medium text-slate-500 capitalize hidden lg:inline">
                        {primaryRole}
                      </span>
                    )}
                    <ChevronDown />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 z-30 mt-1 w-56 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                      <div className="border-b border-slate-100 px-4 py-2">
                        <p className="text-sm font-medium text-slate-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                      <Link
                        href={localePath('/dashboard')}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Uitloggen
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href={localePath('/login')}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-secodary"
              >
                Log in
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation bar */}
        <nav className="hidden border-t border-slate-100 md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
            <Link
              href={localePath('/products')}
              className="border-b-2 border-transparent py-3 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary"
            >
              Producten
            </Link>
            {isLoggedIn && (
              <Link
                href={localePath('/dashboard')}
                className="border-b-2 border-transparent py-3 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary"
              >
                Dashboard
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white md:hidden">
            <div className="space-y-1 px-4 py-3">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="mb-3">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Zoek producten..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </form>

              <Link
                href={localePath('/products')}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Producten
              </Link>
              {isLoggedIn && (
                <>
                  <Link
                    href={localePath('/dashboard')}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Dashboard
                  </Link>

                  {/* Mobile BU switcher */}
                  {hasMultipleBUs && (
                    <div className="border-t border-slate-100 pt-2 mt-2">
                      <p className="px-3 text-xs font-semibold uppercase text-slate-400">
                        Business Unit
                      </p>
                      {businessUnits.map((bu) => (
                        <button
                          key={bu.id}
                          onClick={() => {
                            selectBusinessUnit(bu.id);
                            setMobileMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          {bu.id === currentBusinessUnit?.id && (
                            <span className="text-primary">&#10003;</span>
                          )}
                          {bu.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Mobile Store switcher */}
                  {hasMultipleStores && (
                    <div className="border-t border-slate-100 pt-2 mt-2">
                      <p className="px-3 text-xs font-semibold uppercase text-slate-400">
                        Store
                      </p>
                      {stores.map((store) => (
                        <button
                          key={store.key}
                          onClick={() => {
                            selectStore(store.key);
                            setMobileMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          {store.key === currentStore?.key && (
                            <span className="text-primary">&#10003;</span>
                          )}
                          {store.name || store.key}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-2 mt-2">
                    <p className="px-3 text-xs text-slate-500">
                      {user?.firstName} {user?.lastName} ({user?.email})
                    </p>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <MiniCart />
    </>
  );
}
