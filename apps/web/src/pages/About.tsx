import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <p className="mt-4 leading-relaxed text-[var(--color-muted)]">
        Self-hosted streaming UI platform. Phase 0 provides the monorepo shell, shared connector
        contracts, API health check, and Docker dev stack. Browse, play, and connectors arrive in
        later phases.
      </p>
      <p className="mt-6">
        <Link to="/" className="text-[var(--color-primary)] hover:underline">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
