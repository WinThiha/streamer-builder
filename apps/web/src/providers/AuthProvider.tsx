import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAuthSession,
  loginAdmin as apiLogin,
  logoutAdmin as apiLogout,
  type AuthSessionResponse,
} from '../lib/api';

type AuthContextValue = {
  session: AuthSessionResponse | undefined;
  isLoading: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: session, isLoading, refetch } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: fetchAuthSession,
    staleTime: 30_000,
  });

  const login = useCallback(
    async (password: string) => {
      await apiLogin(password);
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    await queryClient.invalidateQueries({ queryKey: ['auth'] });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      login,
      logout,
      refetch: async () => {
        await refetch();
      },
    }),
    [session, isLoading, login, logout, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
