import { useQuery } from '@tanstack/react-query';
import { fetchCatalogHome } from '../lib/api';
import { CatalogError, CatalogLoading } from '../components/CatalogStatus';
import { HeroBanner } from '../components/HeroBanner';
import { MediaRow } from '../components/MediaRow';

export function Home() {
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
      {data?.featured && <HeroBanner featured={data.featured} />}

      {data && (
        <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-6">
          {data.rows.map((row) => (
            <MediaRow key={row.name} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}
