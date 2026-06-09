import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, type ReactNode } from 'react';
import { fetchHealth } from '../lib/api';
import { isPrototypeBuildMode } from '../lib/app-mode';

export type AppMode = 'production' | 'prototype';

type AppModeContextValue = {
  mode: AppMode;
  isLoading: boolean;
};

const AppModeContext = createContext<AppModeContextValue | null>(null);

function resolveMode(appMode: string | undefined): AppMode {
  if (appMode === 'prototype') return 'prototype';
  if (appMode === 'production') return 'production';
  return isPrototypeBuildMode() ? 'prototype' : 'production';
}

export function AppModeProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['health', 'app-mode'],
    queryFn: fetchHealth,
    staleTime: 60_000,
  });

  const mode = resolveMode(data?.appMode);

  if (isLoading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-300">
        Loading…
      </div>
    );
  }

  return (
    <AppModeContext.Provider value={{ mode, isLoading: false }}>{children}</AppModeContext.Provider>
  );
}

export function useAppMode(): AppModeContextValue {
  const ctx = useContext(AppModeContext);
  if (!ctx) {
    throw new Error('useAppMode must be used within AppModeProvider');
  }
  return ctx;
}

export function useIsPrototypeMode(): boolean {
  return useAppMode().mode === 'prototype';
}
