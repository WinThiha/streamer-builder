import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { EmbedPlayerView } from '../components/EmbedPlayerView';
import { ShakaPlayerView } from '../components/ShakaPlayerView';
import { SourcePicker } from '../components/SourcePicker';
import { CatalogError, CatalogLoading } from '../components/CatalogStatus';
import { fetchPlayResolve, type PlayLocationState } from '../lib/api';
import type { PlaybackSource } from '../lib/types';

function SingleSourceMeta({ source }: { source: PlaybackSource }) {
  return (
    <p className="mb-4 text-sm text-[var(--color-muted)]">
      Source:{' '}
      <span className="font-medium text-[var(--color-foreground)]">{source.label}</span>{' '}
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${
          source.kind === 'embed'
            ? 'bg-amber-500/15 text-amber-300 ring-amber-500/30'
            : source.kind === 'hls'
              ? 'bg-red-500/15 text-red-300 ring-red-500/30'
              : 'bg-sky-500/15 text-sky-300 ring-sky-500/30'
        }`}
      >
        {source.kind}
      </span>
    </p>
  );
}

export function PlayPage() {
  const location = useLocation();
  const state = location.state as PlayLocationState | null;
  const [selectedSource, setSelectedSource] = useState<PlaybackSource | null>(null);

  const {
    data: resolveData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['play', 'resolve', state?.mediaRef],
    queryFn: () => fetchPlayResolve(state!.mediaRef),
    enabled: Boolean(state?.mediaRef),
  });

  const sources = resolveData?.sources ?? [];

  useEffect(() => {
    const list = resolveData?.sources ?? [];
    if (list.length === 0) {
      setSelectedSource(null);
      return;
    }
    setSelectedSource((current) => {
      if (current && list.some((s) => s.id === current.id)) {
        return current;
      }
      return list[0] ?? null;
    });
  }, [resolveData]);

  if (!state?.mediaRef) {
    return <Navigate to="/" replace />;
  }

  const { mediaRef, title } = state;
  const detailPath = mediaRef.type === 'movie' ? `/movie/${mediaRef.id}` : `/tv/${mediaRef.id}`;
  const contextLabel =
    mediaRef.type === 'movie'
      ? `Movie · TMDB ${mediaRef.id}`
      : `TV · TMDB ${mediaRef.id} · S${mediaRef.season} E${mediaRef.episode}`;

  const isEmbedSelected = selectedSource?.kind === 'embed';
  const canPlayShaka =
    selectedSource && (selectedSource.kind === 'hls' || selectedSource.kind === 'progressive');
  const showSingleSourceMeta = !isLoading && !isError && sources.length === 1 && selectedSource;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <BackButton to={detailPath} ariaLabel="Back to details" className="mb-6" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{title ?? 'Now Playing'}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{contextLabel}</p>
        </div>
        {!isLoading && !isError && sources.length > 1 && (
          <SourcePicker
            sources={sources}
            selectedId={selectedSource?.id ?? null}
            onSelect={setSelectedSource}
            className="w-full shrink-0 sm:w-auto sm:min-w-[240px]"
          />
        )}
      </div>

      <div className="mt-4">
        {isLoading && <CatalogLoading />}
        {isError && <CatalogError message={(error as Error).message} />}
        {!isLoading && !isError && sources.length === 0 && (
          <CatalogError message="No streams available for this title." />
        )}
        {!isLoading && !isError && sources.length > 0 && selectedSource && (
          <>
            {showSingleSourceMeta && <SingleSourceMeta source={selectedSource} />}
            {isEmbedSelected && (
              <EmbedPlayerView
                key={selectedSource.id}
                src={selectedSource.url}
                label={selectedSource.label}
                sandboxEnabled={selectedSource.embedIframeSandboxEnabled}
                sandboxPolicy={selectedSource.embedIframeSandboxPolicy}
                allow={selectedSource.embedIframeAllow}
              />
            )}
            {canPlayShaka && (
              <ShakaPlayerView key={selectedSource.id} src={selectedSource.url} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
