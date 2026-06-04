import { useQuery } from '@tanstack/react-query';
import { fetchCatalogHome } from '../lib/api';
import { CatalogError, CatalogLoading } from '../components/CatalogStatus';
import { useSiteConfig } from '../providers/SiteConfigProvider';
import { HomeHeroRowsLayout } from './home/HomeHeroRowsLayout';
import { HomeGridFirstLayout } from './home/HomeGridFirstLayout';

export function Home() {
  const { config } = useSiteConfig();
  const templateId = config?.templateId ?? 'hero-rows';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['catalog', 'home'],
    queryFn: fetchCatalogHome,
  });

  return (
    <div>
      {isLoading && <CatalogLoading fullScreen />}
      {isError && (
        <div className="mx-auto max-w-6xl px-6 py-10">
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
  );
}
