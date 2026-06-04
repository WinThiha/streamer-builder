import { backdropUrl, posterUrl } from '../tmdb/images.js';
import type { HomepageBlock } from '@movie-streamer/shared';
import { HOMEPAGE_CATEGORY_LABELS } from '@movie-streamer/shared';
import type {
  TmdbMediaItem,
  TmdbMovieDetail,
  TmdbPagedResponse,
  TmdbSeasonDetail,
  TmdbTvDetail,
} from '../tmdb/client.js';
import type {
  CatalogItem,
  CatalogRow,
  EpisodeItem,
  FeaturedTitle,
  MovieDetail,
  SearchCatalogResponse,
  SeasonDetailResponse,
  TvDetail,
} from './types.js';

function mediaTitle(item: TmdbMediaItem): string {
  return item.title ?? item.name ?? 'Untitled';
}

function toCatalogItem(item: TmdbMediaItem, type?: 'movie' | 'tv'): CatalogItem | null {
  const resolvedType = type ?? item.media_type;
  if (resolvedType !== 'movie' && resolvedType !== 'tv') {
    return null;
  }

  return {
    id: String(item.id),
    type: resolvedType,
    title: mediaTitle(item),
    posterUrl: posterUrl(item.poster_path),
  };
}

function itemsForCategory(
  categoryKey: HomepageBlock['categoryKey'],
  data: TmdbPagedResponse<TmdbMediaItem>,
): CatalogItem[] {
  if (categoryKey === 'popular_movies' || categoryKey === 'top_rated_movies') {
    return data.results
      .map((item) => toCatalogItem(item, 'movie'))
      .filter((item): item is CatalogItem => item !== null);
  }
  if (categoryKey === 'popular_tv') {
    return data.results
      .map((item) => toCatalogItem(item, 'tv'))
      .filter((item): item is CatalogItem => item !== null);
  }
  return data.results
    .map((item) => toCatalogItem(item))
    .filter((item): item is CatalogItem => item !== null);
}

export function mapHomeRowsFromBlocks(
  blocks: HomepageBlock[],
  categoryResults: TmdbPagedResponse<TmdbMediaItem>[],
): CatalogRow[] {
  return blocks.map((block, index) => ({
    name: block.label ?? HOMEPAGE_CATEGORY_LABELS[block.categoryKey],
    items: itemsForCategory(block.categoryKey, categoryResults[index]!),
  }));
}

/** @deprecated Use mapHomeRowsFromBlocks with site config blocks */
export function mapHomeRows(
  trending: TmdbPagedResponse<TmdbMediaItem>,
  popularMovies: TmdbPagedResponse<TmdbMediaItem>,
  popularTv: TmdbPagedResponse<TmdbMediaItem>,
): { rows: CatalogRow[] } {
  return {
    rows: mapHomeRowsFromBlocks(
      [
        { id: 'trending', categoryKey: 'trending_day' },
        { id: 'popular-movies', categoryKey: 'popular_movies' },
        { id: 'popular-tv', categoryKey: 'popular_tv' },
      ],
      [trending, popularMovies, popularTv],
    ),
  };
}

export function toFeaturedTitle(
  type: 'movie' | 'tv',
  detail: MovieDetail | TvDetail,
): FeaturedTitle {
  return {
    id: detail.id,
    type,
    title: detail.title,
    overview: detail.overview,
    backdropUrl: detail.backdropUrl,
    posterUrl: detail.posterUrl,
  };
}

export function mapSearchResults(data: TmdbPagedResponse<TmdbMediaItem>): SearchCatalogResponse {
  return {
    results: data.results
      .map((item) => toCatalogItem(item))
      .filter((item): item is CatalogItem => item !== null),
  };
}

export function mapMovieDetail(data: TmdbMovieDetail): MovieDetail {
  return {
    id: String(data.id),
    title: data.title,
    overview: data.overview ?? '',
    posterUrl: posterUrl(data.poster_path),
    backdropUrl: backdropUrl(data.backdrop_path),
    releaseDate: data.release_date ?? null,
    runtimeMinutes: data.runtime ?? null,
    rating: data.vote_average ?? null,
    genres: data.genres?.map((genre) => genre.name) ?? [],
  };
}

function averageEpisodeRuntime(episodeRunTime?: number[]): number | null {
  if (!episodeRunTime?.length) return null;
  const total = episodeRunTime.reduce((sum, value) => sum + value, 0);
  return Math.round(total / episodeRunTime.length);
}

export function mapTvDetail(data: TmdbTvDetail): TvDetail {
  return {
    id: String(data.id),
    title: data.name,
    overview: data.overview ?? '',
    posterUrl: posterUrl(data.poster_path),
    backdropUrl: backdropUrl(data.backdrop_path),
    firstAirDate: data.first_air_date ?? null,
    rating: data.vote_average ?? null,
    genres: data.genres?.map((genre) => genre.name) ?? [],
    seasonCount: data.number_of_seasons ?? null,
    episodeRuntimeMinutes: averageEpisodeRuntime(data.episode_run_time),
    seasons: data.seasons
      .filter((season) => season.season_number > 0)
      .map((season) => ({
        seasonNumber: season.season_number,
        name: season.name,
        episodeCount: season.episode_count,
      })),
  };
}

export function mapSeasonDetail(data: TmdbSeasonDetail): SeasonDetailResponse {
  const episodes: EpisodeItem[] = data.episodes.map((episode) => ({
    episodeNumber: episode.episode_number,
    seasonNumber: episode.season_number,
    title: episode.name,
    overview: episode.overview ?? '',
  }));

  return {
    seasonNumber: data.season_number,
    episodes,
  };
}
