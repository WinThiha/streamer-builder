import { sourceSchema, type ManualConnectorConfig, type Source } from '@movie-streamer/shared';
import type { ConnectorRecord } from '../../connectors/repository.js';

export function resolveManualConnector(connector: ConnectorRecord): Source[] {
  const config = connector.config as ManualConnectorConfig;
  return config.sources.map((partial, index) =>
    sourceSchema.parse({
      ...partial,
      id: partial.id ?? `${connector.id}-${index}`,
      connectorId: connector.id,
    }),
  );
}
