import {
  HOMEPAGE_CATEGORY_LABELS,
  HOMEPAGE_CATEGORY_KEYS,
  type HomepageBlock,
  type HomepageCategoryKey,
  type SiteConfig,
  type TemplateId,
} from '@movie-streamer/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchAdminSiteConfig, patchSiteConfigDraft } from '../../lib/api';

function newBlockId(): string {
  return `block-${crypto.randomUUID().slice(0, 8)}`;
}

export function HomepagePage() {
  const queryClient = useQueryClient();
  const { data: adminData, isLoading } = useQuery({
    queryKey: ['site', 'config', 'admin'],
    queryFn: fetchAdminSiteConfig,
  });

  const [draft, setDraft] = useState<SiteConfig | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (adminData?.draft) {
      setDraft(adminData.draft);
    }
  }, [adminData?.draft]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error('No draft');
      return patchSiteConfigDraft({
        templateId: draft.templateId,
        homepage: draft.homepage,
      });
    },
    onSuccess: () => {
      setMessage('Homepage draft saved.');
      void queryClient.invalidateQueries({ queryKey: ['site'] });
    },
    onError: (err) => setMessage((err as Error).message),
  });

  if (isLoading || !draft) {
    return <p className="text-[var(--color-muted)]">Loading homepage settings…</p>;
  }

  const updateBlock = (index: number, patch: Partial<HomepageBlock>) => {
    const blocks = draft.homepage.blocks.map((b, i) => (i === index ? { ...b, ...patch } : b));
    setDraft({ ...draft, homepage: { ...draft.homepage, blocks } });
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= draft.homepage.blocks.length) return;
    const blocks = [...draft.homepage.blocks];
    const [item] = blocks.splice(index, 1);
    blocks.splice(next, 0, item!);
    setDraft({ ...draft, homepage: { ...draft.homepage, blocks } });
  };

  const removeBlock = (index: number) => {
    if (draft.homepage.blocks.length <= 1) return;
    const blocks = draft.homepage.blocks.filter((_, i) => i !== index);
    setDraft({ ...draft, homepage: { ...draft.homepage, blocks } });
  };

  const addBlock = (categoryKey: HomepageCategoryKey) => {
    const blocks = [
      ...draft.homepage.blocks,
      { id: newBlockId(), categoryKey },
    ];
    setDraft({ ...draft, homepage: { ...draft.homepage, blocks } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Homepage</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Choose layout template and catalog rows (TMDB categories). Publish to update the live site.
        </p>
      </div>

      {message && <p className="text-sm text-[var(--color-muted)]">{message}</p>}

      <section className="space-y-3 rounded-lg border border-neutral-800 p-4">
        <h2 className="font-medium">Layout template</h2>
        <div className="flex gap-4 text-sm">
          {(['hero-rows', 'grid-first'] as TemplateId[]).map((id) => (
            <label key={id} className="flex items-center gap-2">
              <input
                type="radio"
                name="templateId"
                checked={draft.templateId === id}
                onChange={() => setDraft({ ...draft, templateId: id })}
              />
              {id}
            </label>
          ))}
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.homepage.showHero}
            onChange={(e) =>
              setDraft({
                ...draft,
                homepage: { ...draft.homepage, showHero: e.target.checked },
              })
            }
          />
          Show featured hero (hero-rows uses large banner; grid-first uses compact featured)
        </label>
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-800 p-4">
        <h2 className="font-medium">Category rows</h2>
        <ul className="space-y-3">
          {draft.homepage.blocks.map((block, index) => (
            <li
              key={block.id}
              className="flex flex-wrap items-center gap-2 rounded border border-neutral-800 bg-[var(--color-surface)] p-3"
            >
              <select
                value={block.categoryKey}
                onChange={(e) =>
                  updateBlock(index, { categoryKey: e.target.value as HomepageCategoryKey })
                }
                className="rounded border border-neutral-700 bg-[var(--color-background)] px-2 py-1 text-sm"
              >
                {HOMEPAGE_CATEGORY_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {HOMEPAGE_CATEGORY_LABELS[key]}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Custom label (optional)"
                value={block.label ?? ''}
                onChange={(e) =>
                  updateBlock(index, { label: e.target.value || undefined })
                }
                className="min-w-[160px] flex-1 rounded border border-neutral-700 bg-[var(--color-background)] px-2 py-1 text-sm"
              />
              <button
                type="button"
                className="rounded border border-neutral-700 px-2 py-1 text-xs"
                onClick={() => moveBlock(index, -1)}
                disabled={index === 0}
              >
                Up
              </button>
              <button
                type="button"
                className="rounded border border-neutral-700 px-2 py-1 text-xs"
                onClick={() => moveBlock(index, 1)}
                disabled={index === draft.homepage.blocks.length - 1}
              >
                Down
              </button>
              <button
                type="button"
                className="rounded border border-red-900 px-2 py-1 text-xs text-red-300"
                onClick={() => removeBlock(index)}
                disabled={draft.homepage.blocks.length <= 1}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--color-muted)]">Add row:</span>
          {HOMEPAGE_CATEGORY_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className="rounded border border-neutral-700 px-2 py-1 text-xs hover:border-[var(--color-primary)]"
              onClick={() => addBlock(key)}
            >
              + {HOMEPAGE_CATEGORY_LABELS[key]}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        disabled={saveMutation.isPending}
        onClick={() => saveMutation.mutate()}
        className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        {saveMutation.isPending ? 'Saving…' : 'Save draft'}
      </button>
    </div>
  );
}
