import {
  isTvMediaRef,
  resolveEmbedIframeSettings,
  resolveEmbedUrlForMediaRef,
  sourceSchema,
  type EmbedConnectorConfig,
  type MediaRef,
  type Source,
} from '@movie-streamer/shared';
import type { ConnectorRecord } from '../../connectors/repository.js';

export function resolveEmbedConnector(connector: ConnectorRecord, mediaRef: MediaRef): Source[] {
  const config = connector.config as EmbedConnectorConfig;
  const url = resolveEmbedUrlForMediaRef(config, mediaRef);
  if (!url) {
    return [];
  }

  const label = config.sourceLabel ?? connector.label;
  const suffix = isTvMediaRef(mediaRef) ? 'tv' : 'movie';
  const iframe = resolveEmbedIframeSettings(config);

  const source = sourceSchema.parse({
    id: `${connector.id}-embed-${suffix}`,
    connectorId: connector.id,
    label,
    kind: 'embed',
    url,
    embedIframeSandboxEnabled: iframe.sandboxEnabled,
    ...(iframe.sandboxPolicy ? { embedIframeSandboxPolicy: iframe.sandboxPolicy } : {}),
    embedIframeAllow: iframe.allow,
  });

  return [source];
}
