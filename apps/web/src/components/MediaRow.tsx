import { useCallback, useEffect, useRef, useState } from 'react';
import type { CatalogRow } from '../lib/types';
import { MediaCard } from './MediaCard';

type MediaRowProps = {
  row: CatalogRow;
};

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function MediaRow({ row }: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener('scroll', updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, row.items.length]);

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;

    const cards = el.querySelectorAll<HTMLElement>('[data-media-card]');
    if (cards.length === 0) return;

    const { left: edgeLeft, right: edgeRight } = el.getBoundingClientRect();
    const tolerance = 4;

    if (direction === 'right') {
      for (const card of cards) {
        const { right } = card.getBoundingClientRect();
        if (right > edgeRight + tolerance) {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
          return;
        }
      }
      cards[cards.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      return;
    }

    for (let i = cards.length - 1; i >= 0; i--) {
      const card = cards[i]!;
      const { left } = card.getBoundingClientRect();
      if (left < edgeLeft - tolerance) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        return;
      }
    }
    cards[0]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  if (row.items.length === 0) {
    return null;
  }

  const arrowClass =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/90 text-[var(--color-foreground)] transition hover:border-neutral-500 hover:bg-neutral-800 disabled:pointer-events-none disabled:opacity-30';

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">{row.name}</h2>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Scroll left"
          className={arrowClass}
          disabled={!canScrollLeft}
          onClick={() => scroll('left')}
        >
          <ChevronLeft />
        </button>

        <div
          ref={scrollRef}
          className="media-row-scroll flex min-w-0 flex-1 select-none gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain overscroll-y-none scroll-smooth touch-pan-x"
        >
          {row.items.map((item) => (
            <MediaCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>

        <button
          type="button"
          aria-label="Scroll right"
          className={arrowClass}
          disabled={!canScrollRight}
          onClick={() => scroll('right')}
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
