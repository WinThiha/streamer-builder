import type { HomeCatalogResponse } from '../../lib/types';
import { MediaCard } from '../../components/MediaCard';

export function HomeGridFirstLayout({ data }: { data: HomeCatalogResponse }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {data.featured && (
        <section className="mb-8 rounded-lg border border-neutral-800 bg-[var(--color-surface)] p-4 md:flex md:gap-6">
          {data.featured.backdropUrl && (
            <img
              src={data.featured.backdropUrl}
              alt=""
              className="mb-4 max-h-40 w-full rounded object-cover md:mb-0 md:max-h-none md:w-64"
            />
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Featured</p>
            <h2 className="mt-1 text-2xl font-semibold">{data.featured.title}</h2>
            {data.featured.overview && (
              <p className="mt-2 line-clamp-3 text-sm text-[var(--color-muted)]">{data.featured.overview}</p>
            )}
          </div>
        </section>
      )}
      {data.rows.map((row) => (
        <section key={row.name} className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">{row.name}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {row.items.map((item) => (
              <MediaCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
