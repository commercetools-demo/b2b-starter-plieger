'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import useSWR from 'swr';
import { KEY_AUTH_ME } from '@/lib/cache-keys';
import { type AuthUser, meFetcher, loginRequest, logoutRequest, registerRequest } from '@/hooks/useAuthApi';

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    companyName?: string,
  ) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user = null, isLoading, mutate } = useSWR<AuthUser | null>(
    KEY_AUTH_ME,
    meFetcher,
    { revalidateOnFocus: false },
  );

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const login = useCallback(
    async (email: string, password: string) => {
      await loginRequest(email, password);
      await mutate();
    },
    [mutate],
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    await mutate(null, { revalidate: false });
  }, [mutate]);

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      companyName?: string,
    ) => {
      await registerRequest(email, password, firstName, lastName, companyName);
      await mutate();
    },
    [mutate],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: user !== null,
      loading: isLoading,
      login,
      logout,
      register,
      refresh,
    }),
    [user, isLoading, login, logout, register, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
