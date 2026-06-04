import type { SiteConfig } from '@movie-streamer/shared';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { fetchSiteConfig } from '../lib/api';
import { applySiteTheme } from '../lib/theme';

type SiteConfigContextValue = {
  config: SiteConfig | undefined;
  isLoading: boolean;
  isError: boolean;
};

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['site', 'config', 'published'],
    queryFn: fetchSiteConfig,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (data?.theme) {
      applySiteTheme(data.theme);
    }
  }, [data?.theme]);

  return (
    <SiteConfigContext.Provider value={{ config: data, isLoading, isError }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfigContextValue {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error('useSiteConfig must be used within SiteConfigProvider');
  }
  return ctx;
}
