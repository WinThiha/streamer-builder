import { useSiteConfig } from '../providers/SiteConfigProvider';
import { useOverlaySiteConfig } from '../providers/OverlaySiteConfigProvider';

export function useEffectiveSiteConfig() {
  const overlay = useOverlaySiteConfig();
  const published = useSiteConfig();
  if (overlay) {
    return { config: overlay.config, isLoading: false, isError: false };
  }
  return published;
}
