import type { MediaRef, ResolveRequest, ResolveResponse, Source } from '@movie-streamer/shared';
import {
  getConnectorsCacheFingerprint,
  listEnabledConnectors,
  type ConnectorRecord,
} from '../connectors/repository.js';
import {
  bumpResolveCacheGeneration,
  getCachedResolve,
  getResolveCacheGeneration,
  serializeMediaRef,
  setCachedResolve,
} from './cache.js';
import { resolveDemoConnector } from './drivers/demo.js';
import { resolveHttpConnector } from './drivers/http.js';
import { resolveManualConnector } from './drivers/manual.js';

const MAX_SOURCES = 20;

export { bumpResolveCacheGeneration };

async function resolveConnector(
  connector: ConnectorRecord,
  mediaRef: MediaRef,
): Promise<Source[]> {
  switch (connector.kind) {
    case 'demo':
      return resolveDemoConnector(connector);
    case 'manual':
      return resolveManualConnector(connector);
    case 'http':
      return resolveHttpConnector(connector, mediaRef);
    default:
      return [];
  }
}

function mergeSources(sources: Source[], enabled: ConnectorRecord[]): Source[] {
  const priorityByConnector = new Map(enabled.map((c) => [c.id, c.priority]));
  const seen = new Set<string>();
  const merged: Source[] = [];

  const sorted = [...sources].sort((a, b) => {
    const pa = priorityByConnector.get(a.connectorId) ?? 999;
    const pb = priorityByConnector.get(b.connectorId) ?? 999;
    if (pa !== pb) return pa - pb;
    return a.label.localeCompare(b.label);
  });

  for (const source of sorted) {
    if (seen.has(source.url)) continue;
    seen.add(source.url);
    merged.push(source);
  }

  return merged.slice(0, MAX_SOURCES);
}

export async function resolvePlay(request: ResolveRequest): Promise<ResolveResponse> {
  const mediaRefKey = serializeMediaRef(request.mediaRef);
  const fingerprint = await getConnectorsCacheFingerprint();
  const generation = getResolveCacheGeneration();

  const cached = getCachedResolve(mediaRefKey, fingerprint, generation);
  if (cached) {
    return cached;
  }

  const enabled = await listEnabledConnectors();
  const results = await Promise.allSettled(
    enabled.map((connector) => resolveConnector(connector, request.mediaRef)),
  );

  const allSources: Source[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allSources.push(...result.value);
    }
  }

  const response: ResolveResponse = { sources: mergeSources(allSources, enabled) };
  setCachedResolve(mediaRefKey, fingerprint, generation, response);
  return response;
}

export async function testConnector(
  connector: ConnectorRecord,
  mediaRef: MediaRef,
): Promise<{ ok: boolean; sources: Source[]; error?: string }> {
  try {
    const sources = await resolveConnector(connector, mediaRef);
    return { ok: true, sources };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, sources: [], error: message };
  }
}
