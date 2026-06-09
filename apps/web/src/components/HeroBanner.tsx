import { Link, useNavigate } from 'react-router-dom';
import type { FeaturedTitle } from '../lib/types';
import { useAppPath } from '../providers/RouteBaseProvider';

type HeroBannerProps = {
  featured: FeaturedTitle;
};

export function HeroBanner({ featured }: HeroBannerProps) {
  const navigate = useNavigate();
  const playPath = useAppPath('/play');
  const detailPath = useAppPath(
    featured.type === 'movie' ? `/movie/${featured.id}` : `/tv/${featured.id}`,
  );

  function handlePlay() {
    if (featured.type === 'movie') {
      navigate(playPath, {
        state: {
          mediaRef: { provider: 'tmdb', type: 'movie', id: featured.id },
          title: featured.title,
        },
      });
      return;
    }

    navigate(playPath, {
      state: {
        mediaRef: { provider: 'tmdb', type: 'tv', id: featured.id, season: 1, episode: 1 },
        title: featured.title,
      },
    });
  }

  return (
    <section className="relative h-[min(70vh,560px)] w-full overflow-hidden">
      {featured.backdropUrl ? (
        <img
          src={featured.backdropUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-black/40 to-transparent" />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 pt-24">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
          Featured
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          {featured.title}
        </h1>
        {featured.overview && (
          <p className="mt-4 max-w-xl line-clamp-3 text-sm leading-relaxed text-neutral-300 md:text-base">
            {featured.overview}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePlay}
            className="rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-md transition-all duration-200 ease-out hover:scale-105 hover:bg-neutral-100 hover:shadow-lg hover:shadow-black/40 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ▶ Play
          </button>
          <Link
            to={detailPath}
            className="rounded-md bg-neutral-500/40 px-6 py-2.5 text-sm font-semibold text-white shadow-md backdrop-blur-sm transition-all duration-200 ease-out hover:scale-105 hover:bg-neutral-500/70 hover:shadow-lg hover:shadow-black/40 hover:ring-1 hover:ring-white/30 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            More Info
          </Link>
        </div>
      </div>
    </section>
  );
}
