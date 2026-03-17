'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { BusinessUnit, Store } from '@/lib/types';
import { useAuth } from './AuthContext';

interface BusinessUnitContextValue {
  currentBusinessUnit: BusinessUnit | null;
  currentStore: Store | null;
  businessUnits: BusinessUnit[];
  loading: boolean;
  fetchBusinessUnits: () => Promise<void>;
  selectBusinessUnit: (id: string) => Promise<void>;
  selectStore: (storeKey: string) => Promise<void>;
}

const BusinessUnitContext = createContext<BusinessUnitContextValue | undefined>(
  undefined,
);

async function callSelectBU(
  buId: string,
  buKey: string,
  storeKey: string,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/business-units/${buId}/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessUnitKey: buKey, storeKey }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function BusinessUnitProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [currentBusinessUnit, setCurrentBusinessUnit] =
    useState<BusinessUnit | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const autoSelectedRef = useRef(false);

  const fetchBusinessUnits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/business-units');
      if (res.ok) {
        const data = await res.json();
        const units: BusinessUnit[] =
          data.businessUnits ?? data.results ?? (Array.isArray(data) ? data : []);
        setBusinessUnits(units);

        // Auto-select the first BU and its first store after login
        if (units.length > 0 && !autoSelectedRef.current) {
          autoSelectedRef.current = true;
          const bu = units[0];
          const store = bu.stores?.[0];
          if (store) {
            const ok = await callSelectBU(bu.id, bu.key, store.key);
            if (ok) {
              setCurrentBusinessUnit(bu);
              setCurrentStore(store);
            }
          }
        }
      }
    } catch {
      setBusinessUnits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectBusinessUnit = useCallback(
    async (id: string) => {
      const bu = businessUnits.find((b) => b.id === id);
      if (!bu) return;
      const store = bu.stores?.[0];
      if (!store) return;
      setLoading(true);
      try {
        const ok = await callSelectBU(bu.id, bu.key, store.key);
        if (ok) {
          setCurrentBusinessUnit(bu);
          setCurrentStore(store);
        }
      } finally {
        setLoading(false);
      }
    },
    [businessUnits],
  );

  const selectStore = useCallback(
    async (storeKey: string) => {
      if (!currentBusinessUnit) return;
      const store = currentBusinessUnit.stores?.find((s) => s.key === storeKey);
      if (!store) return;
      setLoading(true);
      try {
        const ok = await callSelectBU(
          currentBusinessUnit.id,
          currentBusinessUnit.key,
          storeKey,
        );
        if (ok) {
          setCurrentStore(store);
        }
      } finally {
        setLoading(false);
      }
    },
    [currentBusinessUnit],
  );

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      fetchBusinessUnits();
    } else if (!authLoading && !isLoggedIn) {
      setBusinessUnits([]);
      setCurrentBusinessUnit(null);
      setCurrentStore(null);
      autoSelectedRef.current = false;
    }
  }, [isLoggedIn, authLoading, fetchBusinessUnits]);

  const value = useMemo<BusinessUnitContextValue>(
    () => ({
      currentBusinessUnit,
      currentStore,
      businessUnits,
      loading,
      fetchBusinessUnits,
      selectBusinessUnit,
      selectStore,
    }),
    [
      currentBusinessUnit,
      currentStore,
      businessUnits,
      loading,
      fetchBusinessUnits,
      selectBusinessUnit,
      selectStore,
    ],
  );

  return (
    <BusinessUnitContext.Provider value={value}>
      {children}
    </BusinessUnitContext.Provider>
  );
}

export function useBusinessUnit(): BusinessUnitContextValue {
  const context = useContext(BusinessUnitContext);
  if (context === undefined) {
    throw new Error(
      'useBusinessUnit must be used within a BusinessUnitProvider',
    );
  }
  return context;
}
