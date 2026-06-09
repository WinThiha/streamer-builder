import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { fetchAdminSiteConfig, publishSiteConfig, resetSiteConfigToDefault } from '../lib/api';
import { useAuth } from '../providers/AuthProvider';
import { applyShadcnTheme, applySiteTheme } from '../lib/theme';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AdminShell() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const adminRootRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['site', 'config', 'admin'],
    queryFn: fetchAdminSiteConfig,
  });

  const publishMutation = useMutation({
    mutationFn: publishSiteConfig,
    onSuccess: (data) => {
      applySiteTheme(data.published.theme);
      void queryClient.invalidateQueries({ queryKey: ['site'] });
      void queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetSiteConfigToDefault,
    onSuccess: (data) => {
      setResetDialogOpen(false);
      applySiteTheme(data.published.theme);
      void queryClient.invalidateQueries({ queryKey: ['site'] });
      void queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });

  const hasUnpublishedChanges =
    data &&
    JSON.stringify(data.draft) !== JSON.stringify(data.published);

  const actionsDisabled = resetMutation.isPending || publishMutation.isPending;

  useEffect(() => {
    const theme = data?.published.theme;
    const root = adminRootRef.current;
    if (theme && root) {
      applySiteTheme(theme, root);
      applyShadcnTheme(theme, root);
    }
  }, [data?.published.theme]);

  return (
    <div
      ref={adminRootRef}
      className="dark min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]"
    >
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-6 py-4">
          <span className="font-semibold">Site admin</span>
          <nav className="flex gap-4 text-sm">
            <NavLink
              to="/admin/branding"
              className={({ isActive }) =>
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
              }
            >
              Branding
            </NavLink>
            <NavLink
              to="/admin/homepage"
              className={({ isActive }) =>
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
              }
            >
              Homepage
            </NavLink>
            <NavLink
              to="/admin/preview"
              className={({ isActive }) =>
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
              }
            >
              Preview
            </NavLink>
            <NavLink
              to="/admin/sources"
              className={({ isActive }) =>
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
              }
            >
              Sources
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {isLoading && <span className="text-[var(--color-muted)]">Loading…</span>}
            {hasUnpublishedChanges && (
              <span className="rounded bg-amber-900/40 px-2 py-0.5 text-amber-200">Draft changes</span>
            )}
            <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <AlertDialogTrigger
                disabled={actionsDisabled}
                render={
                  <Button variant="outline" disabled={actionsDisabled}>
                    Reset to defaults
                  </Button>
                }
              />
              <AlertDialogContent size="default">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset to factory defaults?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This restores the original site name, theme colors, hero-rows layout, and default homepage
                    rows. Draft and published config are both reset immediately on the live site.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={resetMutation.isPending}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={resetMutation.isPending}
                    onClick={() => resetMutation.mutate()}
                  >
                    {resetMutation.isPending ? 'Resetting…' : 'Yes, reset everything'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <button
              type="button"
              disabled={actionsDisabled || !hasUnpublishedChanges}
              onClick={() => publishMutation.mutate()}
              className="rounded bg-[var(--color-primary)] px-3 py-1.5 font-medium text-white disabled:opacity-40"
            >
              {publishMutation.isPending ? 'Publishing…' : 'Publish'}
            </button>
            <Link to="/" className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
              View site
            </Link>
            <button
              type="button"
              className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              onClick={async () => {
                await logout();
                navigate('/admin/login');
              }}
            >
              Log out
            </button>
          </div>
        </div>
        {(publishMutation.isError || resetMutation.isError) && (
          <p className="mx-auto max-w-5xl px-6 pb-2 text-sm text-red-400">
            {((publishMutation.error ?? resetMutation.error) as Error).message}
          </p>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-5xl px-6 pb-8 text-sm text-[var(--color-muted)]">
        <button
          type="button"
          className="underline"
          onClick={() => navigate('/')}
        >
          Back to subscriber site
        </button>
      </footer>
    </div>
  );
}
