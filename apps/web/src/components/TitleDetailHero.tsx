import type { ReactNode } from 'react';
import { BackButton } from './BackButton';

type TitleDetailHeroProps = {
  title: string;
  overview: string;
  backdropUrl: string | null;
  metaItems: ReactNode[];
  onPlay: () => void;
  playDisabled?: boolean;
  playLabel?: string;
  children?: ReactNode;
};

export function TitleDetailHero({
  title,
  overview,
  backdropUrl,
  metaItems,
  onPlay,
  playDisabled = false,
  playLabel = 'Play',
  children,
}: TitleDetailHeroProps) {
  const visibleMeta = metaItems.filter(Boolean);

  return (
    <div>
      <section className="relative min-h-[min(85vh,720px)] w-full overflow-hidden">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-black/50 to-black/20" />

        <div className="relative mx-auto flex min-h-[min(85vh,720px)] max-w-6xl flex-col px-6 pb-14 pt-8">
          <BackButton className="mb-8" />

          <div className="mt-auto max-w-2xl">
            <h1 className="text-4xl font-black uppercase tracking-wide text-[var(--color-primary)] drop-shadow-lg md:text-5xl lg:text-6xl">
              {title}
            </h1>

            {visibleMeta.length > 0 && (
              <ul className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-300">
                {visibleMeta.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {index > 0 && <span className="text-neutral-600">•</span>}
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {overview && (
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-300 md:text-base">
                {overview}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onPlay}
                disabled={playDisabled}
                className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-black shadow-md transition-all duration-200 ease-out hover:scale-105 hover:bg-neutral-100 hover:shadow-lg hover:shadow-black/40 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                <span aria-hidden>▶</span>
                {playLabel}
              </button>
            </div>

            {children}
          </div>
        </div>
      </section>
    </div>
  );
}

export function MetaRating({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-medium">
      <span className="text-[var(--color-primary)]">★</span>
      {value}
    </span>
  );
}
