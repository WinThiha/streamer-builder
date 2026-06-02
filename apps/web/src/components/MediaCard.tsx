import { Link } from 'react-router-dom';
import type { CatalogItem } from '../lib/types';

type MediaCardProps = {
  item: CatalogItem;
};

export function MediaCard({ item }: MediaCardProps) {
  const to = item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;

  return (
    <Link
      to={to}
      data-media-card
      draggable={false}
      className="media-card group block w-36 shrink-0 select-none"
    >
      <div className="aspect-[2/3] overflow-hidden rounded-md bg-neutral-800">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            draggable={false}
            className="pointer-events-none h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center text-xs text-[var(--color-muted)]">
            No poster
          </div>
        )}
      </div>
      <p className="pointer-events-none mt-2 line-clamp-2 min-h-10 text-sm font-medium group-hover:text-[var(--color-primary)]">
        {item.title}
      </p>
    </Link>
  );
}
