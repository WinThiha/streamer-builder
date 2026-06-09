import { createContext, useContext, type ReactNode } from 'react';

const RouteBaseContext = createContext('');

export function RouteBaseProvider({ base, children }: { base: string; children: ReactNode }) {
  return <RouteBaseContext.Provider value={base}>{children}</RouteBaseContext.Provider>;
}

export function useRouteBase(): string {
  return useContext(RouteBaseContext);
}

export function useAppPath(subpath: string): string {
  const base = useRouteBase();
  if (subpath === '/' || subpath === '') {
    return base || '/';
  }
  const normalized = subpath.startsWith('/') ? subpath : `/${subpath}`;
  return `${base}${normalized}`;
}
