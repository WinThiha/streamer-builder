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

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(apiUrl('/health'));
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json() as Promise<HealthResponse>;
}
