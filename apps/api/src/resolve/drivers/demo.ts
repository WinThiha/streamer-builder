import { sourceSchema, type DemoConnectorConfig, type Source } from '@movie-streamer/shared';
import { env } from '../../env.js';
import type { ConnectorRecord } from '../../connectors/repository.js';

export function resolveDemoConnector(connector: ConnectorRecord): Source[] {
  const config = connector.config as DemoConnectorConfig;
  const source = sourceSchema.parse({
    id: `${connector.id}-demo`,
    connectorId: connector.id,
    label: config.sourceLabel ?? connector.label,
    kind: 'hls',
    url: env.DEMO_HLS_URL,
  });
  return [source];
}
