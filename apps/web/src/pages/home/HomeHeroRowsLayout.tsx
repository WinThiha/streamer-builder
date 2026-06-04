import type { HomeCatalogResponse } from '../../lib/types';
import { HeroBanner } from '../../components/HeroBanner';
import { MediaRow } from '../../components/MediaRow';

export function HomeHeroRowsLayout({ data }: { data: HomeCatalogResponse }) {
  return (
    <>
      {data.featured && <HeroBanner featured={data.featured} />}
      <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-6">
        {data.rows.map((row) => (
          <MediaRow key={row.name} row={row} />
        ))}
      </div>
    </>
  );
}
