type EmbedPlayerViewProps = {
  src: string;
  label?: string;
  sandboxEnabled?: boolean;
  sandboxPolicy?: string;
  allow?: string;
};

export function EmbedPlayerView({
  src,
  label,
  sandboxEnabled = false,
  sandboxPolicy,
  allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture',
}: EmbedPlayerViewProps) {
  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm text-[var(--color-muted)]">
          Playing <span className="font-medium text-[var(--color-foreground)]">{label}</span>{' '}
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300 ring-1 ring-inset ring-amber-500/30">
            embed
          </span>
        </p>
      )}
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          title={label ?? 'Embedded player'}
          src={src}
          className="h-full w-full border-0"
          allowFullScreen
          {...(sandboxEnabled && sandboxPolicy ? { sandbox: sandboxPolicy } : {})}
          allow={allow}
        />
      </div>
      <p className="text-sm text-[var(--color-muted)]">
        If the player does not load, the embed host may block iframe playback or require sandbox
        off.{' '}
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-primary)] underline hover:no-underline"
        >
          Open embed in new tab
        </a>
      </p>
    </div>
  );
}
