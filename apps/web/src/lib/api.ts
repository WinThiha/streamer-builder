import type {
  DemoSource,
  HomeCatalogResponse,
  MovieDetail,
  SearchCatalogResponse,
  SeasonDetailResponse,
  TvDetail,
} from './types';

const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (apiBase) {
    return `${apiBase}${normalized}`;
  }
  return `/api${normalized}`;
}

export type HealthResponse = {
  status: string;
  appMode: string;
  database: string;
};

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path));
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return fetchJson<HealthResponse>('/health');
}

export async function fetchCatalogHome(): Promise<HomeCatalogResponse> {
  return fetchJson<HomeCatalogResponse>('/v1/catalog/home');
}

export async function fetchCatalogSearch(query: string): Promise<SearchCatalogResponse> {
  const params = new URLSearchParams({ q: query });
  return fetchJson<SearchCatalogResponse>(`/v1/catalog/search?${params}`);
}

function normalizeMovieDetail(data: Partial<MovieDetail> & Pick<MovieDetail, 'id' | 'title' | 'overview'>): MovieDetail {
  return {
    id: data.id,
    title: data.title,
    overview: data.overview ?? '',
    posterUrl: data.posterUrl ?? null,
    backdropUrl: data.backdropUrl ?? null,
    releaseDate: data.releaseDate ?? null,
    runtimeMinutes: data.runtimeMinutes ?? null,
    rating: data.rating ?? null,
    genres: Array.isArray(data.genres) ? data.genres : [],
  };
}

function normalizeTvDetail(
  data: Partial<TvDetail> & Pick<TvDetail, 'id' | 'title' | 'overview'>,
): TvDetail {
  return {
    id: data.id,
    title: data.title,
    overview: data.overview ?? '',
    posterUrl: data.posterUrl ?? null,
    backdropUrl: data.backdropUrl ?? null,
    firstAirDate: data.firstAirDate ?? null,
    rating: data.rating ?? null,
    genres: Array.isArray(data.genres) ? data.genres : [],
    seasonCount: data.seasonCount ?? null,
    episodeRuntimeMinutes: data.episodeRuntimeMinutes ?? null,
    seasons: Array.isArray(data.seasons) ? data.seasons : [],
  };
}

export async function fetchMovieDetail(id: string): Promise<MovieDetail> {
  const data = await fetchJson<Partial<MovieDetail> & Pick<MovieDetail, 'id' | 'title' | 'overview'>>(
    `/v1/catalog/movie/${id}`,
  );
  return normalizeMovieDetail(data);
}

export async function fetchTvDetail(id: string): Promise<TvDetail> {
  const data = await fetchJson<Partial<TvDetail> & Pick<TvDetail, 'id' | 'title' | 'overview'>>(
    `/v1/catalog/tv/${id}`,
  );
  return normalizeTvDetail(data);
}

export async function fetchTvSeason(tvId: string, season: number): Promise<SeasonDetailResponse> {
  return fetchJson<SeasonDetailResponse>(`/v1/catalog/tv/${tvId}/season/${season}`);
}

export async function fetchDemoSource(): Promise<DemoSource> {
  return fetchJson<DemoSource>('/v1/play/demo');
}

export type { PlayLocationState } from './types';
