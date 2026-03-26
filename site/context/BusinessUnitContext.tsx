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
import useSWR from 'swr';
import type { BusinessUnit, Store } from '@/lib/types';
import { useAuth } from './AuthContext';
import { KEY_BUSINESS_UNITS } from '@/lib/cache-keys';
import { businessUnitsFetcher, selectBusinessUnitRequest } from '@/hooks/useBusinessUnitApi';

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

export function BusinessUnitProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [currentBusinessUnit, setCurrentBusinessUnit] =
    useState<BusinessUnit | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const autoSelectedRef = useRef(false);

  const { data: businessUnits = [], isLoading: buLoading, mutate } = useSWR<BusinessUnit[]>(
    isLoggedIn && !authLoading ? KEY_BUSINESS_UNITS : null,
    businessUnitsFetcher,
  );

  // Auto-select first BU and store after login
  useEffect(() => {
    if (businessUnits.length > 0 && !autoSelectedRef.current) {
      autoSelectedRef.current = true;
      const bu = businessUnits[0];
      const store = bu.stores?.[0];
      if (store) {
        selectBusinessUnitRequest(bu.id, bu.key, store.key).then((ok) => {
          if (ok) {
            setCurrentBusinessUnit(bu);
            setCurrentStore(store);
          }
        });
      }
    }
  }, [businessUnits]);

  // Reset on logout
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      setCurrentBusinessUnit(null);
      setCurrentStore(null);
      autoSelectedRef.current = false;
    }
  }, [isLoggedIn, authLoading]);

  const fetchBusinessUnits = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const selectBusinessUnit = useCallback(
    async (id: string) => {
      const bu = businessUnits.find((b) => b.id === id);
      if (!bu) return;
      const store = bu.stores?.[0];
      if (!store) return;
      setSelectionLoading(true);
      try {
        const ok = await selectBusinessUnitRequest(bu.id, bu.key, store.key);
        if (ok) {
          setCurrentBusinessUnit(bu);
          setCurrentStore(store);
        }
      } finally {
        setSelectionLoading(false);
      }
    },
    [businessUnits],
  );

  const selectStore = useCallback(
    async (storeKey: string) => {
      if (!currentBusinessUnit) return;
      const store = currentBusinessUnit.stores?.find((s) => s.key === storeKey);
      if (!store) return;
      setSelectionLoading(true);
      try {
        const ok = await selectBusinessUnitRequest(
          currentBusinessUnit.id,
          currentBusinessUnit.key,
          storeKey,
        );
        if (ok) {
          setCurrentStore(store);
        }
      } finally {
        setSelectionLoading(false);
      }
    },
    [currentBusinessUnit],
  );

  const value = useMemo<BusinessUnitContextValue>(
    () => ({
      currentBusinessUnit,
      currentStore,
      businessUnits,
      loading: buLoading || selectionLoading,
      fetchBusinessUnits,
      selectBusinessUnit,
      selectStore,
    }),
    [
      currentBusinessUnit,
      currentStore,
      businessUnits,
      buLoading,
      selectionLoading,
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
