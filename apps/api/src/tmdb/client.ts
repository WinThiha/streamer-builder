const TMDB_BASE = 'https://api.themoviedb.org/3';

export class TmdbError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

export type TmdbMediaItem = {
  id: number;
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
};

export type TmdbPagedResponse<T> = {
  results: T[];
};

export type TmdbMovieDetail = {
  id: number;
  title: string;
  overview: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  runtime?: number;
  vote_average?: number;
  genres?: Array<{ id: number; name: string }>;
};

export type TmdbTvDetail = {
  id: number;
  name: string;
  overview: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  first_air_date?: string;
  vote_average?: number;
  number_of_seasons?: number;
  episode_run_time?: number[];
  genres?: Array<{ id: number; name: string }>;
  seasons: Array<{
    season_number: number;
    name: string;
    episode_count: number;
  }>;
};

export type TmdbSeasonDetail = {
  season_number: number;
  episodes: Array<{
    episode_number: number;
    season_number: number;
    name: string;
    overview: string;
  }>;
};

export class TmdbClient {
  constructor(private readonly apiKey: string) {}

  private async fetch<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${TMDB_BASE}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new TmdbError(res.status, body || res.statusText);
    }

    return res.json() as Promise<T>;
  }

  getTrendingAll() {
    return this.fetch<TmdbPagedResponse<TmdbMediaItem>>('/trending/all/day');
  }

  getPopularMovies() {
    return this.fetch<TmdbPagedResponse<TmdbMediaItem>>('/movie/popular');
  }

  getPopularTv() {
    return this.fetch<TmdbPagedResponse<TmdbMediaItem>>('/tv/popular');
  }

  getTopRatedMovies() {
    return this.fetch<TmdbPagedResponse<TmdbMediaItem>>('/movie/top_rated');
  }

  getConfiguration() {
    return this.fetch<{ images?: { base_url?: string } }>('/configuration');
  }

  searchMulti(query: string) {
    return this.fetch<TmdbPagedResponse<TmdbMediaItem>>('/search/multi', { query });
  }

  getMovie(id: string) {
    return this.fetch<TmdbMovieDetail>(`/movie/${id}`);
  }

  getTv(id: string) {
    return this.fetch<TmdbTvDetail>(`/tv/${id}`);
  }

  getTvSeason(tvId: string, season: string) {
    return this.fetch<TmdbSeasonDetail>(`/tv/${tvId}/season/${season}`);
  }
}
