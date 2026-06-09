import { Navigate, Outlet, useParams } from 'react-router-dom';
import { applyPresetOverlay, getPrototypePreset } from '@movie-streamer/shared';
import { OverlaySiteConfigProvider } from '../providers/OverlaySiteConfigProvider';
import { RouteBaseProvider } from '../providers/RouteBaseProvider';
import { PrototypeSubscriberShell } from './PrototypeSubscriberShell';

export function PrototypePresetLayout() {
  const { preset } = useParams<{ preset: string }>();
  const presetDef = preset ? getPrototypePreset(preset) : undefined;

  if (!presetDef) {
    return <Navigate to="/" replace />;
  }

  const config = applyPresetOverlay(presetDef);
  const base = `/prototype/${preset}`;

  return (
    <OverlaySiteConfigProvider config={config}>
      <RouteBaseProvider base={base}>
        <PrototypeSubscriberShell>
          <Outlet />
        </PrototypeSubscriberShell>
      </RouteBaseProvider>
    </OverlaySiteConfigProvider>
  );
}
