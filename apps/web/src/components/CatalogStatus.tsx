type CatalogLoadingProps = {
  /** Use for full-page fetches (detail routes). */
  fullScreen?: boolean;
};

export function CatalogLoading({ fullScreen = false }: CatalogLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`flex items-center justify-center ${fullScreen ? 'min-h-[60vh]' : 'py-12'}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12" aria-hidden>
          <div className="absolute inset-0 rounded-full border-2 border-neutral-800" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--color-primary)]" />
        </div>
        <p className="text-sm font-medium tracking-wide text-[var(--color-muted)]">Loading</p>
      </div>
    </div>
  );
}

type CatalogErrorProps = {
  message?: string;
};

export function CatalogError({ message = 'Something went wrong loading content.' }: CatalogErrorProps) {
  return (
    <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3">
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}
