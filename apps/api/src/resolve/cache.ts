import type { ResolveResponse, Source } from '@movie-streamer/shared';

const DEFAULT_TTL_MS = 15 * 60 * 1000;
const EXPIRY_BUFFER_MS = 60 * 1000;

type CacheEntry = {
  expiresAt: number;
  response: ResolveResponse;
};

const cache = new Map<string, CacheEntry>();

let cacheGeneration = 0;

export function bumpResolveCacheGeneration(): void {
  cacheGeneration += 1;
  cache.clear();
}

export function getResolveCacheGeneration(): number {
  return cacheGeneration;
}

function cacheKey(mediaRefKey: string, fingerprint: string, generation: number): string {
  return `${generation}:${fingerprint}:${mediaRefKey}`;
}

export function computeCacheTtlMs(sources: Source[], defaultTtlMs = DEFAULT_TTL_MS): number {
  const now = Date.now();
  let nearestExpiryMs: number | null = null;

  for (const source of sources) {
    if (!source.expiresAt) continue;
    const expiresAtMs = Date.parse(source.expiresAt);
    if (Number.isNaN(expiresAtMs)) continue;
    const ttlFromSource = expiresAtMs - now - EXPIRY_BUFFER_MS;
    if (ttlFromSource <= 0) return 0;
    if (nearestExpiryMs === null || ttlFromSource < nearestExpiryMs) {
      nearestExpiryMs = ttlFromSource;
    }
  }

  if (nearestExpiryMs === null) return defaultTtlMs;
  return Math.min(defaultTtlMs, nearestExpiryMs);
}

export function getCachedResolve(
  mediaRefKey: string,
  fingerprint: string,
  generation: number,
): ResolveResponse | null {
  const key = cacheKey(mediaRefKey, fingerprint, generation);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.response;
}

export function setCachedResolve(
  mediaRefKey: string,
  fingerprint: string,
  generation: number,
  response: ResolveResponse,
  ttlMs = DEFAULT_TTL_MS,
): void {
  if (ttlMs <= 0) return;
  const key = cacheKey(mediaRefKey, fingerprint, generation);
  cache.set(key, {
    expiresAt: Date.now() + ttlMs,
    response,
  });
}

export function serializeMediaRef(mediaRef: {
  provider: string;
  type: string;
  id: string;
  season?: number;
  episode?: number;
}): string {
  return JSON.stringify(mediaRef);
}
