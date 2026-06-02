import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { CatalogError, CatalogLoading } from '../components/CatalogStatus';
import { MetaRating, TitleDetailHero } from '../components/TitleDetailHero';
import { fetchMovieDetail } from '../lib/api';
import { formatRating, formatRuntime, formatYear } from '../lib/format';

export function MovieDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['catalog', 'movie', id],
    queryFn: () => fetchMovieDetail(id),
    enabled: id.length > 0,
  });

  function handlePlay() {
    if (!data) return;
    navigate('/play', {
      state: {
        mediaRef: { provider: 'tmdb', type: 'movie', id: data.id },
        title: data.title,
      },
    });
  }

  if (isLoading) return <CatalogLoading fullScreen />;
  if (isError) return <CatalogError message={(error as Error).message} />;
  if (!data) return null;

  const rating = formatRating(data.rating);
  const year = formatYear(data.releaseDate);
  const runtime = formatRuntime(data.runtimeMinutes);

  const metaItems = [
    rating ? <MetaRating key="rating" value={rating} /> : null,
    year,
    runtime,
    ...(data.genres ?? []),
  ];

  return (
    <TitleDetailHero
      title={data.title}
      overview={data.overview}
      backdropUrl={data.backdropUrl ?? data.posterUrl}
      metaItems={metaItems}
      onPlay={handlePlay}
    />
  );
}
