import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { fetchSetupStatus } from '../lib/api';
import { useAuth } from '../providers/AuthProvider';
import { useIsPrototypeMode } from '../providers/AppModeProvider';

export function SetupGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const prototypeMode = useIsPrototypeMode();
  const { data: setup, isLoading } = useQuery({
    queryKey: ['setup', 'status'],
    queryFn: fetchSetupStatus,
    enabled: !prototypeMode,
  });

  if (prototypeMode) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-300">
        Loading…
      </div>
    );
  }

  if (!setup?.complete && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  if (setup?.complete && location.pathname === '/setup') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export function AdminAuthGate() {
  const location = useLocation();
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-300">
        Loading…
      </div>
    );
  }

  const authRequired = session?.authRequired ?? session?.setupComplete;
  const authenticated = session?.authenticated ?? false;

  if (location.pathname === '/admin/login') {
    if (authenticated || !authRequired) {
      return <Navigate to="/admin/branding" replace />;
    }
    return <Outlet />;
  }

  if (authRequired && !authenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
