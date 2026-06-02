import { useQuery } from '@tanstack/react-query';
import { CatalogError, CatalogLoading } from '../components/CatalogStatus';
import { BackButton } from '../components/BackButton';
import { fetchHealth } from '../lib/api';

export function About() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: 1,
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <p className="mt-4 leading-relaxed text-[var(--color-muted)]">
        Self-hosted streaming UI platform. Phase 1 adds TMDB browse, search, title detail, and demo
        HLS playback via Shaka Player. Connector resolution and source picker arrive in Phase 2.
      </p>

      <section className="mt-8 rounded-lg border border-neutral-800 bg-[var(--color-surface)] p-6">
        <h2 className="text-lg font-semibold">API health</h2>
        {isLoading && <CatalogLoading />}
        {isError && <CatalogError message={(error as Error).message} />}
        {data && (
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-[var(--color-muted)]">Status</dt>
              <dd>{data.status}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[var(--color-muted)]">App mode</dt>
              <dd>{data.appMode}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[var(--color-muted)]">Database</dt>
              <dd>{data.database}</dd>
            </div>
          </dl>
        )}
      </section>

      <div className="mt-6">
        <BackButton ariaLabel="Back home" />
      </div>
    </div>
  );
}
