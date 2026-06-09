import {
  assertSafeOutboundUrl,
  sourceSchema,
  type ManifestConnectorConfig,
  type MediaRef,
  type Source,
} from '@movie-streamer/shared';
import type { ConnectorRecord } from '../../connectors/repository.js';
import { isProductionRuntime } from '../../env.js';

const DEFAULT_TIMEOUT_MS = 10_000;

type ManifestEntry = {
  mediaRef: MediaRef;
  sources: Array<Omit<Source, 'connectorId'>>;
};

type ManifestDocument = {
  entries: ManifestEntry[];
};

function mediaRefKey(mediaRef: MediaRef): string {
  return JSON.stringify(mediaRef);
}

export async function resolveManifestConnector(
  connector: ConnectorRecord,
  mediaRef: MediaRef,
): Promise<Source[]> {
  const config = connector.config as ManifestConnectorConfig;
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    assertSafeOutboundUrl(config.manifestUrl, { allowLocalhost: !isProductionRuntime() });

    const res = await fetch(config.manifestUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const body = (await res.json()) as ManifestDocument;
    const key = mediaRefKey(mediaRef);
    const entry = body.entries?.find((e) => mediaRefKey(e.mediaRef) === key);
    if (!entry) return [];

    return entry.sources.map((source, index) =>
      sourceSchema.parse({
        ...source,
        id: source.id ?? `${connector.id}-${index}`,
        connectorId: connector.id,
      }),
    );
  } finally {
    clearTimeout(timer);
  }
}
