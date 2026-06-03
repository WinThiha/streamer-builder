import type { ManualConnectorConfig } from '@movie-streamer/shared';
import { createConnector, getConnectorById, updateConnector } from './repository.js';

/**
 * Legal HLS sample distinct from demo (TS). Apple fMP4 variant plays reliably in Shaka;
 * the old Mux test URL often fails to load segments in the browser.
 */
const MANUAL_SAMPLE_HLS =
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8';

const LEGACY_BROKEN_MANUAL_URL = 'test-streams.mux.dev';

function manualConnectorConfig(): ManualConnectorConfig {
  return {
    kind: 'manual',
    sources: [
      {
        id: 'manual-sample-hls',
        label: 'Manual Test Stream',
        kind: 'hls',
        url: MANUAL_SAMPLE_HLS,
      },
    ],
  };
}

export async function seedConnectors(): Promise<void> {
  const demo = await getConnectorById('demo-default');
  if (!demo) {
    await createConnector({
      id: 'demo-default',
      label: 'Demo Server',
      kind: 'demo',
      enabled: true,
      priority: 10,
      config: { kind: 'demo', sourceLabel: 'Demo Stream' },
    });
  }

  const manual = await getConnectorById('manual-sample');
  if (!manual) {
    await createConnector({
      id: 'manual-sample',
      label: 'Sample Manual Server',
      kind: 'manual',
      enabled: true,
      priority: 20,
      config: manualConnectorConfig(),
    });
    return;
  }

  const config = manual.config as ManualConnectorConfig;
  const usesLegacyUrl = config.sources.some((s) => s.url.includes(LEGACY_BROKEN_MANUAL_URL));
  if (usesLegacyUrl) {
    await updateConnector('manual-sample', { config: manualConnectorConfig() });
  }
}
