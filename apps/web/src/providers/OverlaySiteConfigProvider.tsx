import type { SiteConfig } from '@movie-streamer/shared';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { applySiteTheme } from '../lib/theme';

type OverlaySiteConfigContextValue = {
  config: SiteConfig;
};

const OverlaySiteConfigContext = createContext<OverlaySiteConfigContextValue | null>(null);

export function OverlaySiteConfigProvider({
  config,
  children,
}: {
  config: SiteConfig;
  children: ReactNode;
}) {
  useEffect(() => {
    applySiteTheme(config.theme);
  }, [config.theme]);

  return (
    <OverlaySiteConfigContext.Provider value={{ config }}>
      {children}
    </OverlaySiteConfigContext.Provider>
  );
}

export function useOverlaySiteConfig(): OverlaySiteConfigContextValue | null {
  return useContext(OverlaySiteConfigContext);
}
