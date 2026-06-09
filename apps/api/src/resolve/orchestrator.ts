import type {
  AdminResolveResponse,
  ConnectorResolveResult,
  MediaRef,
  ResolveRequest,
  ResolveResponse,
  Source,
} from '@movie-streamer/shared';
import { hostnameAllowed } from '@movie-streamer/shared';
import {
  getConnectorsCacheFingerprint,
  listEnabledConnectors,
  type ConnectorRecord,
} from '../connectors/repository.js';
import { getPublishedSiteConfig } from '../site-config/repository.js';
import {
  bumpResolveCacheGeneration,
  computeCacheTtlMs,
  getCachedResolve,
  getResolveCacheGeneration,
  serializeMediaRef,
  setCachedResolve,
} from './cache.js';
import { resolveDemoConnector } from './drivers/demo.js';
import { resolveEmbedConnector } from './drivers/embed.js';
import { resolveHttpConnector } from './drivers/http.js';
import { resolveManualConnector } from './drivers/manual.js';
import { resolveManifestConnector } from './drivers/manifest.js';

const MAX_SOURCES = 20;

export { bumpResolveCacheGeneration };

async function resolveConnector(
  connector: ConnectorRecord,
  mediaRef: MediaRef,
  embedAllowlist: string[],
): Promise<Source[]> {
  let sources: Source[];
  switch (connector.kind) {
    case 'demo':
      sources = await resolveDemoConnector(connector);
      break;
    case 'manual':
      sources = await resolveManualConnector(connector);
      break;
    case 'http':
      sources = await resolveHttpConnector(connector, mediaRef);
      break;
    case 'embed':
      sources = resolveEmbedConnector(connector, mediaRef);
      break;
    case 'manifest':
      sources = await resolveManifestConnector(connector, mediaRef);
      break;
    default:
      sources = [];
  }

  if (embedAllowlist.length > 0) {
    sources = sources.filter((source) => {
      if (source.kind !== 'embed') return true;
      return hostnameAllowed(source.url, embedAllowlist);
    });
  }

  return sources;
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

async function getPlaybackSettings(): Promise<{
  connectorResolveMode: 'show-all' | 'first-good';
  embedAllowlist: string[];
}> {
  const published = await getPublishedSiteConfig();
  return {
    connectorResolveMode: published?.playback?.connectorResolveMode ?? 'show-all',
    embedAllowlist: published?.playback?.embedAllowlist ?? [],
  };
}

type ResolveInternals = {
  sources: Source[];
  connectorResults: ConnectorResolveResult[];
};

async function resolveInternals(request: ResolveRequest): Promise<ResolveInternals> {
  const { connectorResolveMode, embedAllowlist } = await getPlaybackSettings();
  const enabled = await listEnabledConnectors();
  const connectorResults: ConnectorResolveResult[] = [];
  const allSources: Source[] = [];

  if (connectorResolveMode === 'first-good') {
    for (const connector of enabled) {
      try {
        const sources = await resolveConnector(connector, request.mediaRef, embedAllowlist);
        connectorResults.push({
          connectorId: connector.id,
          ok: true,
          sourceCount: sources.length,
        });
        if (sources.length > 0) {
          allSources.push(...sources);
          break;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        connectorResults.push({
          connectorId: connector.id,
          ok: false,
          sourceCount: 0,
          error: message,
        });
      }
    }
  } else {
    const results = await Promise.allSettled(
      enabled.map((connector) => resolveConnector(connector, request.mediaRef, embedAllowlist)),
    );

    for (let i = 0; i < enabled.length; i++) {
      const connector = enabled[i]!;
      const result = results[i]!;
      if (result.status === 'fulfilled') {
        connectorResults.push({
          connectorId: connector.id,
          ok: true,
          sourceCount: result.value.length,
        });
        allSources.push(...result.value);
      } else {
        const message =
          result.reason instanceof Error ? result.reason.message : 'Unknown error';
        connectorResults.push({
          connectorId: connector.id,
          ok: false,
          sourceCount: 0,
          error: message,
        });
      }
    }
  }

  return {
    sources: mergeSources(allSources, enabled),
    connectorResults,
  };
}

export async function resolvePlay(request: ResolveRequest): Promise<ResolveResponse> {
  const mediaRefKey = serializeMediaRef(request.mediaRef);
  const fingerprint = await getConnectorsCacheFingerprint();
  const generation = getResolveCacheGeneration();

  const cached = getCachedResolve(mediaRefKey, fingerprint, generation);
  if (cached) {
    return cached;
  }

  const { sources } = await resolveInternals(request);
  const response: ResolveResponse = { sources };
  const ttlMs = computeCacheTtlMs(sources);
  setCachedResolve(mediaRefKey, fingerprint, generation, response, ttlMs);
  return response;
}

export async function resolvePlayWithDiagnostics(
  request: ResolveRequest,
): Promise<AdminResolveResponse> {
  return resolveInternals(request);
}

export async function testConnector(
  connector: ConnectorRecord,
  mediaRef: MediaRef,
): Promise<{ ok: boolean; sources: Source[]; error?: string }> {
  try {
    const published = await getPublishedSiteConfig();
    const embedAllowlist = published?.playback?.embedAllowlist ?? [];
    const sources = await resolveConnector(connector, mediaRef, embedAllowlist);
    return { ok: true, sources };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, sources: [], error: message };
  }
}
