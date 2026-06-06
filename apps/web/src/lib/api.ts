import type { SiteConfig, SiteConfigPatch } from '@movie-streamer/shared';
import type {
  HomeCatalogResponse,
  MovieDetail,
  PlaybackSource,
  PlayLocationState,
  ResolveResponse,
  SearchCatalogResponse,
  SeasonDetailResponse,
  TvDetail,
} from './types';

export type AdminSiteConfigResponse = {
  draft: SiteConfig;
  published: SiteConfig;
  updatedAt: string;
  publishedAt: string | null;
};

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
  setupComplete?: boolean;
};

export type SetupStatusResponse = {
  complete: boolean;
  steps: {
    adminPassword: boolean;
    tmdbKey: boolean;
  };
};

export type AuthSessionResponse = {
  setupComplete: boolean;
  authenticated: boolean;
  authRequired?: boolean;
};

type ApiErrorBody = {
  error?: string;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
};

function formatApiError(body: ApiErrorBody | null, status: number): string {
  const parts: string[] = [];
  if (body?.error) {
    parts.push(body.error);
  }
  if (body?.details?.fieldErrors) {
    for (const [field, messages] of Object.entries(body.details.fieldErrors)) {
      if (messages?.length) {
        parts.push(`${field}: ${messages.join(', ')}`);
      }
    }
  }
  if (body?.details?.formErrors?.length) {
    parts.push(...body.details.formErrors);
  }
  return parts.join(' · ') || `Request failed: ${status}`;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    credentials: 'include',
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new Error(formatApiError(body, res.status));
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

export async function fetchPlayResolve(
  mediaRef: PlayLocationState['mediaRef'],
): Promise<ResolveResponse> {
  return fetchJson<ResolveResponse>('/v1/play/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mediaRef }),
  });
}

export async function fetchSiteConfig(): Promise<SiteConfig> {
  return fetchJson<SiteConfig>('/v1/site/config');
}

export async function fetchAdminSiteConfig(): Promise<AdminSiteConfigResponse> {
  return fetchJson<AdminSiteConfigResponse>('/v1/admin/site/config');
}

export async function patchSiteConfigDraft(patch: SiteConfigPatch): Promise<AdminSiteConfigResponse> {
  return fetchJson<AdminSiteConfigResponse>('/v1/admin/site/config/draft', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
}

export async function publishSiteConfig(): Promise<AdminSiteConfigResponse> {
  return fetchJson<AdminSiteConfigResponse>('/v1/admin/site/config/publish', {
    method: 'POST',
  });
}

export async function resetSiteConfigToDefault(): Promise<AdminSiteConfigResponse> {
  return fetchJson<AdminSiteConfigResponse>('/v1/admin/site/config/reset-default', {
    method: 'POST',
  });
}

export async function uploadSiteLogo(file: File): Promise<AdminSiteConfigResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(apiUrl('/v1/admin/site/logo'), {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Upload failed: ${res.status}`);
  }
  return res.json() as Promise<AdminSiteConfigResponse>;
}

export async function fetchPreviewCatalogHome(): Promise<HomeCatalogResponse> {
  return fetchJson<HomeCatalogResponse>('/v1/admin/site/preview-home');
}

export async function fetchSetupStatus(): Promise<SetupStatusResponse> {
  return fetchJson<SetupStatusResponse>('/v1/setup/status');
}

export type SetupCompletePayload = {
  adminPassword: string;
  tmdbApiKey: string;
  connector?: {
    label: string;
    kind: 'http' | 'manual' | 'embed';
    priority?: number;
    config: unknown;
  };
};

export async function completeSetup(payload: SetupCompletePayload): Promise<SetupStatusResponse> {
  return fetchJson<SetupStatusResponse>('/v1/setup/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function fetchAuthSession(): Promise<AuthSessionResponse> {
  return fetchJson<AuthSessionResponse>('/v1/admin/auth/session');
}

export async function loginAdmin(password: string): Promise<void> {
  await fetchJson<{ ok: boolean }>('/v1/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
}

export async function logoutAdmin(): Promise<void> {
  await fetchJson<{ ok: boolean }>('/v1/admin/auth/logout', { method: 'POST' });
}

export type ConnectorRecord = {
  id: string;
  label: string;
  kind: 'demo' | 'manual' | 'http' | 'embed';
  enabled: boolean;
  priority: number;
  config: unknown;
  createdAt: string;
  updatedAt: string;
};

export type ConnectorsListResponse = {
  connectors: ConnectorRecord[];
};

export type ConnectorTestResponse = {
  connectorId: string;
  ok: boolean;
  sources: PlaybackSource[];
  error?: string;
};

export type CreateConnectorPayload = {
  id?: string;
  label: string;
  kind: 'demo' | 'manual' | 'http' | 'embed';
  enabled?: boolean;
  priority?: number;
  config: unknown;
};

export type UpdateConnectorPayload = {
  label?: string;
  enabled?: boolean;
  priority?: number;
  config?: unknown;
};

export async function fetchConnectors(): Promise<ConnectorsListResponse> {
  return fetchJson<ConnectorsListResponse>('/v1/admin/connectors');
}

export async function createConnector(payload: CreateConnectorPayload): Promise<{ connector: ConnectorRecord }> {
  return fetchJson<{ connector: ConnectorRecord }>('/v1/admin/connectors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateConnector(
  id: string,
  payload: UpdateConnectorPayload,
): Promise<{ connector: ConnectorRecord }> {
  return fetchJson<{ connector: ConnectorRecord }>(`/v1/admin/connectors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteConnector(id: string): Promise<{ ok: boolean }> {
  return fetchJson<{ ok: boolean }>(`/v1/admin/connectors/${id}`, {
    method: 'DELETE',
  });
}

export async function testConnector(
  id: string,
  mediaRef: PlayLocationState['mediaRef'],
): Promise<ConnectorTestResponse> {
  return fetchJson<ConnectorTestResponse>(`/v1/admin/connectors/${id}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mediaRef }),
  });
}

export type { PlayLocationState } from './types';
