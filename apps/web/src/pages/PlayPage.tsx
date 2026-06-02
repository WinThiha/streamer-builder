import { useQuery } from '@tanstack/react-query';
import { Navigate, useLocation } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { ShakaPlayerView } from '../components/ShakaPlayerView';
import { CatalogError, CatalogLoading } from '../components/CatalogStatus';
import { fetchDemoSource, type PlayLocationState } from '../lib/api';

export function PlayPage() {
  const location = useLocation();
  const state = location.state as PlayLocationState | null;

  const { data: source, isLoading, isError, error } = useQuery({
    queryKey: ['play', 'demo'],
    queryFn: fetchDemoSource,
  });

  if (!state?.mediaRef) {
    return <Navigate to="/" replace />;
  }

  const { mediaRef, title } = state;
  const detailPath = mediaRef.type === 'movie' ? `/movie/${mediaRef.id}` : `/tv/${mediaRef.id}`;
  const contextLabel =
    mediaRef.type === 'movie'
      ? `Movie · TMDB ${mediaRef.id}`
      : `TV · TMDB ${mediaRef.id} · S${mediaRef.season} E${mediaRef.episode}`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <BackButton to={detailPath} ariaLabel="Back to details" className="mb-6" />

      <div>
        <h1 className="text-2xl font-bold">{title ?? 'Now Playing'}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{contextLabel}</p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">Demo stream — same for all titles in Phase 1</p>
      </div>

      <div className="mt-6">
        {isLoading && <CatalogLoading />}
        {isError && <CatalogError message={(error as Error).message} />}
        {source && <ShakaPlayerView src={source.url} />}
      </div>
    </div>
  );
}
