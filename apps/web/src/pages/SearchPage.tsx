import { useQuery } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CatalogError, CatalogLoading } from '../components/CatalogStatus';
import { MediaCard } from '../components/MediaCard';
import { fetchCatalogSearch } from '../lib/api';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [input, setInput] = useState(initialQuery);
  const query = searchParams.get('q')?.trim() ?? '';

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['catalog', 'search', query],
    queryFn: () => fetchCatalogSearch(query),
    enabled: query.length > 0,
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Search</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search movies and TV…"
          className="flex-1 rounded-md border border-neutral-700 bg-[var(--color-surface)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <button
          type="submit"
          className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Search
        </button>
      </form>

      <div className="mt-8">
        {!query && (
          <p className="text-sm text-[var(--color-muted)]">Enter a query to search the catalog.</p>
        )}
        {query && (isLoading || isFetching) && <CatalogLoading />}
        {query && isError && <CatalogError message={(error as Error).message} />}
        {query && data && data.results.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">No results found.</p>
        )}
        {data && data.results.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {data.results.map((item) => (
              <MediaCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
