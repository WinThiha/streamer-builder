import { useEffect, useId, useRef, useState } from 'react';
import type { PlaybackSource } from '../lib/types';

type SourcePickerProps = {
  sources: PlaybackSource[];
  selectedId: string | null;
  onSelect: (source: PlaybackSource) => void;
  className?: string;
};

const kindStyles: Record<PlaybackSource['kind'], string> = {
  hls: 'bg-red-500/15 text-red-300 ring-red-500/30',
  progressive: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  embed: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
};

function KindBadge({ kind }: { kind: PlaybackSource['kind'] }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${kindStyles[kind]}`}
    >
      {kind}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SourcePicker({
  sources,
  selectedId,
  onSelect,
  className = '',
}: SourcePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = sources.find((s) => s.id === selectedId) ?? sources[0];

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (sources.length <= 1 || !selected) {
    return null;
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
        Source
      </span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full min-w-[min(100%,240px)] items-center gap-2 rounded-xl border border-neutral-700/80 bg-[var(--color-surface)]/90 px-3.5 py-2.5 text-left text-sm shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-[border-color,box-shadow] hover:border-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate font-medium text-[var(--color-foreground)]">{selected.label}</span>
          <KindBadge kind={selected.kind} />
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Playback sources"
          className="absolute right-0 z-20 mt-2 w-full min-w-[260px] overflow-hidden rounded-xl border border-neutral-700/90 bg-neutral-950/95 p-1 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-md"
        >
          {sources.map((source) => {
            const isSelected = source.id === selected.id;
            return (
              <li key={source.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(source);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-[var(--color-primary)]/15 text-[var(--color-foreground)]'
                      : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-[var(--color-foreground)]'
                  }`}
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-medium">{source.label}</span>
                    <span className="truncate text-xs text-[var(--color-muted)]">{source.connectorId}</span>
                  </span>
                  <KindBadge kind={source.kind} />
                  {isSelected && (
                    <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-[var(--color-primary)]">
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
