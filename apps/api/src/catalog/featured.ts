import type { TmdbClient, TmdbMediaItem, TmdbPagedResponse } from '../tmdb/client.js';
import {
  mapMovieDetail,
  mapTvDetail,
  toFeaturedTitle,
} from '../catalog/mappers.js';
import type { FeaturedTitle } from '../catalog/types.js';

export async function resolveFeaturedTitle(
  tmdb: TmdbClient,
  trending: TmdbPagedResponse<TmdbMediaItem>,
): Promise<FeaturedTitle | null> {
  const candidate =
    trending.results.find(
      (item) =>
        (item.media_type === 'movie' || item.media_type === 'tv') && item.backdrop_path,
    ) ??
    trending.results.find((item) => item.media_type === 'movie' || item.media_type === 'tv');

  if (!candidate?.media_type || (candidate.media_type !== 'movie' && candidate.media_type !== 'tv')) {
    return null;
  }

  const id = String(candidate.id);

  if (candidate.media_type === 'movie') {
    const detail = await tmdb.getMovie(id);
    return toFeaturedTitle('movie', mapMovieDetail(detail));
  }

  const detail = await tmdb.getTv(id);
  return toFeaturedTitle('tv', mapTvDetail(detail));
}
