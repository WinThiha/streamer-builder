import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchAdminSiteConfig, fetchPreviewCatalogHome } from '../../lib/api';
import { CatalogError, CatalogLoading } from '../../components/CatalogStatus';
import { applySiteTheme, siteThemeStyle } from '../../lib/theme';
import { useSiteConfig } from '../../providers/SiteConfigProvider';
import { HomeHeroRowsLayout } from '../home/HomeHeroRowsLayout';
import { HomeGridFirstLayout } from '../home/HomeGridFirstLayout';

/** Preview uses draft theme/layout inside a scoped frame so admin chrome keeps published theme. */
export function PreviewPage() {
  const { config: published } = useSiteConfig();
  const { data: adminData } = useQuery({
    queryKey: ['site', 'config', 'admin'],
    queryFn: fetchAdminSiteConfig,
  });

  const draft = adminData?.draft;
  const templateId = draft?.templateId ?? 'hero-rows';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['catalog', 'home', 'preview'],
    queryFn: fetchPreviewCatalogHome,
    enabled: Boolean(draft),
  });

  // Keep admin chrome on published theme; draft theme is scoped to the preview frame only.
  useEffect(() => {
    const publishedTheme = published?.theme ?? adminData?.published.theme;
    if (publishedTheme) {
      applySiteTheme(publishedTheme);
    }
    return () => {
      if (publishedTheme) {
        applySiteTheme(publishedTheme);
      }
    };
  }, [published?.theme, adminData?.published.theme]);

  if (!draft) {
    return <p className="text-[var(--color-muted)]">Loading preview…</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Draft preview</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Preview uses draft branding, template, and homepage rows inside the frame below. The live site at `/` and this admin UI use published theme until you publish.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-800">
        <div className="border-b border-neutral-800 bg-[var(--color-surface)] px-4 py-2 text-xs text-[var(--color-muted)]">
          Preview — {draft.identity.siteName} ({templateId})
        </div>
        <div style={siteThemeStyle(draft.theme)}>
          {isLoading && <CatalogLoading fullScreen />}
          {isError && (
            <div className="p-6">
              <CatalogError message={(error as Error).message} />
            </div>
          )}
          {data &&
            (templateId === 'grid-first' ? (
              <HomeGridFirstLayout data={data} />
            ) : (
              <HomeHeroRowsLayout data={data} />
            ))}
        </div>
      </div>
    </div>
  );
}
