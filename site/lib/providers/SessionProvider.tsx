'use client';

import { createContext, useContext, useCallback } from 'react';
import useSWR from 'swr';
import type { SessionData } from '@/lib/types';

interface SessionContextValue {
  session: SessionData;
  isLoading: boolean;
  refetch: () => void;
}

const SessionContext = createContext<SessionContextValue>({
  session: {},
  isLoading: false,
  refetch: () => {},
});

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, mutate } = useSWR<SessionData>('/api/session', fetcher);
  const refetch = useCallback(() => { mutate(); }, [mutate]);

  return (
    <SessionContext.Provider value={{ session: data ?? {}, isLoading, refetch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
