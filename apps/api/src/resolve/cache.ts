import type { ResolveResponse } from '@movie-streamer/shared';

const DEFAULT_TTL_MS = 15 * 60 * 1000;

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
