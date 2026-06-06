export type CatalogItemType = 'movie' | 'tv';

export type CatalogItem = {
  id: string;
  type: CatalogItemType;
  title: string;
  posterUrl: string | null;
};

export type CatalogRow = {
  name: string;
  items: CatalogItem[];
};

export type FeaturedTitle = {
  id: string;
  type: CatalogItemType;
  title: string;
  overview: string;
  backdropUrl: string | null;
  posterUrl: string | null;
};

export type HomeCatalogResponse = {
  featured: FeaturedTitle | null;
  rows: CatalogRow[];
};

export type SearchCatalogResponse = {
  results: CatalogItem[];
};

export type MovieDetail = {
  id: string;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  rating: number | null;
  genres: string[];
};

export type TvSeasonSummary = {
  seasonNumber: number;
  name: string;
  episodeCount: number;
};

export type TvDetail = {
  id: string;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  firstAirDate: string | null;
  rating: number | null;
  genres: string[];
  seasonCount: number | null;
  episodeRuntimeMinutes: number | null;
  seasons: TvSeasonSummary[];
};

export type EpisodeItem = {
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  overview: string;
};

export type SeasonDetailResponse = {
  seasonNumber: number;
  episodes: EpisodeItem[];
};

export type PlaybackSource = {
  id: string;
  connectorId: string;
  label: string;
  kind: 'hls' | 'progressive' | 'embed';
  url: string;
  expiresAt?: string;
  embedIframeSandboxEnabled?: boolean;
  embedIframeSandboxPolicy?: string;
  embedIframeAllow?: string;
};

export type ResolveResponse = {
  sources: PlaybackSource[];
};

/** @deprecated Use PlaybackSource */
export type DemoSource = PlaybackSource;

export type PlayLocationState = {
  mediaRef: {
    provider: string;
    type: 'movie' | 'tv' | 'episode';
    id: string;
    season?: number;
    episode?: number;
  };
  title?: string;
};
