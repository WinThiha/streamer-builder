import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchHealth } from '../lib/api';

export function Home() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: 1,
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Movie Streamer</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        White-label streaming UI — Phase 0 foundation
      </p>

      <section className="mt-8 rounded-lg border border-neutral-800 bg-[var(--color-surface)] p-6">
        <h2 className="text-lg font-semibold">API health</h2>
        {isLoading && <p className="mt-2 text-sm text-[var(--color-muted)]">Checking…</p>}
        {isError && (
          <p className="mt-2 text-sm text-red-400">
            {(error as Error).message || 'API unreachable'}
          </p>
        )}
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

      <p className="mt-6">
        <Link to="/about" className="text-[var(--color-primary)] hover:underline">
          About this project →
        </Link>
      </p>
    </div>
  );
}
