import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CatalogError, CatalogLoading } from '../components/CatalogStatus';
import { MetaRating, TitleDetailHero } from '../components/TitleDetailHero';
import { fetchTvDetail, fetchTvSeason } from '../lib/api';
import { useAppPath } from '../providers/RouteBaseProvider';
import { formatRating, formatRuntime, formatYear } from '../lib/format';

export function TvDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const playPath = useAppPath('/play');
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);

  const { data: show, isLoading, isError, error } = useQuery({
    queryKey: ['catalog', 'tv', id],
    queryFn: () => fetchTvDetail(id),
    enabled: id.length > 0,
  });

  useEffect(() => {
    if (show && show.seasons.length > 0 && selectedSeason === null) {
      setSelectedSeason(show.seasons[0].seasonNumber);
    }
  }, [show, selectedSeason]);

  const { data: seasonData, isLoading: seasonLoading } = useQuery({
    queryKey: ['catalog', 'tv', id, 'season', selectedSeason],
    queryFn: () => fetchTvSeason(id, selectedSeason!),
    enabled: id.length > 0 && selectedSeason !== null,
  });

  useEffect(() => {
    if (seasonData && seasonData.episodes.length > 0 && selectedEpisode === null) {
      setSelectedEpisode(seasonData.episodes[0].episodeNumber);
    }
  }, [seasonData, selectedEpisode]);

  useEffect(() => {
    setSelectedEpisode(null);
  }, [selectedSeason]);

  function handlePlay() {
    if (!show || selectedSeason === null || selectedEpisode === null) return;
    navigate(playPath, {
      state: {
        mediaRef: {
          provider: 'tmdb',
          type: 'tv',
          id: show.id,
          season: selectedSeason,
          episode: selectedEpisode,
        },
        title: show.title,
      },
    });
  }

  if (isLoading) return <CatalogLoading fullScreen />;
  if (isError) return <CatalogError message={(error as Error).message} />;
  if (!show) return null;

  const rating = formatRating(show.rating);
  const year = formatYear(show.firstAirDate);
  const runtime = formatRuntime(show.episodeRuntimeMinutes);
  const seasonLabel =
    show.seasonCount && show.seasonCount > 0 ? `${show.seasonCount} seasons` : null;

  const metaItems = [
    rating ? <MetaRating key="rating" value={rating} /> : null,
    year,
    runtime,
    seasonLabel,
    ...(show.genres ?? []),
  ];

  return (
    <div>
      <TitleDetailHero
        title={show.title}
        overview={show.overview}
        backdropUrl={show.backdropUrl ?? show.posterUrl}
        metaItems={metaItems}
        onPlay={handlePlay}
        playDisabled={selectedSeason === null || selectedEpisode === null}
      />

      {show.seasons.length > 0 && (
        <section className="border-t border-neutral-800 bg-[var(--color-surface)]">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <h2 className="text-lg font-semibold">Episodes</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="season" className="text-sm font-medium text-[var(--color-muted)]">
                  Season
                </label>
                <select
                  id="season"
                  value={selectedSeason ?? ''}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
                >
                  {show.seasons.map((season) => (
                    <option key={season.seasonNumber} value={season.seasonNumber}>
                      {season.name} ({season.episodeCount} episodes)
                    </option>
                  ))}
                </select>
              </div>

              {seasonLoading && <CatalogLoading />}
              {seasonData && seasonData.episodes.length > 0 && (
                <div>
                  <label htmlFor="episode" className="text-sm font-medium text-[var(--color-muted)]">
                    Episode
                  </label>
                  <select
                    id="episode"
                    value={selectedEpisode ?? ''}
                    onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
                  >
                    {seasonData.episodes.map((episode) => (
                      <option key={episode.episodeNumber} value={episode.episodeNumber}>
                        E{episode.episodeNumber}: {episode.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
