import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchVendorPresets } from '../../lib/api';

export function PrototypeGalleryPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['vendor', 'presets'],
    queryFn: fetchVendorPresets,
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-2xl font-semibold">Movie Streamer</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Try legal demo presets, then configure and download your Deploy Pack.
            </p>
          </div>
          <Link
            to="/configure"
            className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
          >
            Configure your site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        {isLoading && <p className="text-neutral-400">Loading presets…</p>}
        {isError && <p className="text-red-400">Failed to load presets.</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.presets.map((preset) => (
            <article
              key={preset.slug}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-5"
            >
              <h2 className="text-lg font-semibold">{preset.name}</h2>
              <p className="mt-2 text-sm text-neutral-400">{preset.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
                <Link
                  to={`/prototype/${preset.slug}`}
                  className="text-red-400 hover:text-red-300"
                >
                  Try preset →
                </Link>
                <Link
                  to={`/configure?preset=${preset.slug}`}
                  className="text-neutral-300 hover:text-white"
                >
                  Configure this look →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
