import {
  assertSafeOutboundUrl,
  externalResolveResponseSchema,
  sourceSchema,
  type HttpConnectorConfig,
  type MediaRef,
  type Source,
} from '@movie-streamer/shared';
import type { ConnectorRecord } from '../../connectors/repository.js';
import { isProductionRuntime } from '../../env.js';

const DEFAULT_TIMEOUT_MS = 10_000;

export function validateHttpConnectorUrl(resolveUrl: string): void {
  assertSafeOutboundUrl(resolveUrl, { allowLocalhost: !isProductionRuntime() });
}

export async function resolveHttpConnector(
  connector: ConnectorRecord,
  mediaRef: MediaRef,
): Promise<Source[]> {
  const config = connector.config as HttpConnectorConfig;
  validateHttpConnectorUrl(config.resolveUrl);
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(config.resolveUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ mediaRef }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const body: unknown = await res.json();
    const parsed = externalResolveResponseSchema.parse(body);
    return parsed.sources.map((source, index) =>
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
