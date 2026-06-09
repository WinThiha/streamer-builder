import {
  HOMEPAGE_CATEGORY_KEYS,
  HOMEPAGE_CATEGORY_LABELS,
  PROTOTYPE_PRESETS,
  applyPresetOverlay,
  defaultSiteConfig,
  getPrototypePreset,
  type DeployPackKind,
  type SiteConfig,
  type SiteTheme,
  type TemplateId,
} from '@movie-streamer/shared';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchCatalogHome, generateDeployPack } from '../../lib/api';
import { CatalogError, CatalogLoading } from '../../components/CatalogStatus';
import { siteThemeStyle } from '../../lib/theme';
import { HomeHeroRowsLayout } from '../home/HomeHeroRowsLayout';
import { HomeGridFirstLayout } from '../home/HomeGridFirstLayout';

function siteConfigFromPresetSlug(slug: string | null): SiteConfig {
  if (!slug) return defaultSiteConfig;
  const preset = getPrototypePreset(slug);
  return preset ? applyPresetOverlay(preset) : defaultSiteConfig;
}

const THEME_FIELDS: Array<{ key: keyof SiteTheme; label: string }> = [
  { key: 'background', label: 'Background' },
  { key: 'foreground', label: 'Foreground' },
  { key: 'primary', label: 'Primary' },
  { key: 'muted', label: 'Muted' },
  { key: 'surface', label: 'Surface' },
];

export function ConfigureWizardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const presetSlug = searchParams.get('preset');
  const [step, setStep] = useState(0);
  const [domain, setDomain] = useState('stream.example.com');
  const [acmeEmail, setAcmeEmail] = useState('');
  const [draft, setDraft] = useState<SiteConfig>(() => siteConfigFromPresetSlug(presetSlug));
  const [packKind, setPackKind] = useState<DeployPackKind>('deploy-only');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(siteConfigFromPresetSlug(presetSlug));
  }, [presetSlug]);

  function handlePresetChange(slug: string) {
    if (slug) {
      setSearchParams({ preset: slug });
    } else {
      setSearchParams({});
    }
  }

  const { data: catalog, isLoading, isError, error: catalogError } = useQuery({
    queryKey: ['catalog', 'home', 'wizard-preview'],
    queryFn: fetchCatalogHome,
    enabled: step >= 2,
  });

  const previewData = useMemo(() => catalog, [catalog]);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const blob = await generateDeployPack({
        domain,
        acmeEmail: acmeEmail || undefined,
        siteConfig: draft,
        packKind,
        imageTag: 'latest',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download =
        packKind === 'full-source'
          ? `${draft.identity.siteName.replace(/\s+/g, '-').toLowerCase()}-full-source.zip`
          : `${draft.identity.siteName.replace(/\s+/g, '-').toLowerCase()}-deploy-pack.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-sm text-neutral-400 hover:text-neutral-200">
            ← Gallery
          </Link>
          <span className="text-sm text-neutral-400">Configure wizard · step {step + 1} of 4</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        {step === 0 && (
          <section className="space-y-4">
            <h1 className="text-2xl font-semibold">Branding</h1>
            <label className="block text-sm">
              Start from preset
              <select
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                value={presetSlug ?? ''}
                onChange={(e) => handlePresetChange(e.target.value)}
              >
                <option value="">Default (Movie Streamer)</option>
                {PROTOTYPE_PRESETS.map((preset) => (
                  <option key={preset.slug} value={preset.slug}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Site name
              <input
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                value={draft.identity.siteName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, identity: { ...d.identity, siteName: e.target.value } }))
                }
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {THEME_FIELDS.map(({ key, label }) => (
                <label key={key} className="block text-sm">
                  {label}
                  <input
                    type="color"
                    className="mt-1 h-10 w-full cursor-pointer rounded border border-neutral-700 bg-neutral-900"
                    value={draft.theme[key]}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        theme: { ...d.theme, [key]: e.target.value },
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <h1 className="text-2xl font-semibold">Layout & homepage</h1>
            <label className="block text-sm">
              Template
              <select
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                value={draft.templateId}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, templateId: e.target.value as TemplateId }))
                }
              >
                <option value="hero-rows">Hero rows</option>
                <option value="grid-first">Grid first</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.homepage.showHero}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    homepage: { ...d.homepage, showHero: e.target.checked },
                  }))
                }
              />
              Show hero banner
            </label>
            <p className="text-sm text-neutral-400">
              Homepage rows: {draft.homepage.blocks.map((b) => HOMEPAGE_CATEGORY_LABELS[b.categoryKey]).join(', ')}
            </p>
            <div className="flex flex-wrap gap-2">
              {HOMEPAGE_CATEGORY_KEYS.map((key) => {
                const active = draft.homepage.blocks.some((b) => b.categoryKey === key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`rounded px-3 py-1 text-sm ${active ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                    onClick={() =>
                      setDraft((d) => {
                        const blocks = active
                          ? d.homepage.blocks.filter((b) => b.categoryKey !== key)
                          : [...d.homepage.blocks, { id: key, categoryKey: key }];
                        return {
                          ...d,
                          homepage: { ...d.homepage, blocks: blocks.length ? blocks : d.homepage.blocks },
                        };
                      })
                    }
                  >
                    {HOMEPAGE_CATEGORY_LABELS[key]}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <h1 className="text-2xl font-semibold">Live preview</h1>
            <div className="overflow-hidden rounded-lg border border-neutral-800">
              <div className="border-b border-neutral-800 bg-neutral-900 px-4 py-2 text-xs text-neutral-400">
                Preview — {draft.identity.siteName} ({draft.templateId})
              </div>
              <div style={siteThemeStyle(draft.theme)}>
                {isLoading && <CatalogLoading fullScreen />}
                {isError && (
                  <div className="p-6">
                    <CatalogError message={(catalogError as Error).message} />
                  </div>
                )}
                {previewData &&
                  (draft.templateId === 'grid-first' ? (
                    <HomeGridFirstLayout data={previewData} />
                  ) : (
                    <HomeHeroRowsLayout data={previewData} />
                  ))}
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <h1 className="text-2xl font-semibold">Domain & download</h1>
            <label className="block text-sm">
              Customer domain
              <input
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              ACME email (optional)
              <input
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                value={acmeEmail}
                onChange={(e) => setAcmeEmail(e.target.value)}
              />
            </label>
            <fieldset className="space-y-3 rounded border border-neutral-800 p-4">
              <legend className="px-1 text-sm font-medium">Pack type</legend>
              <label className="flex cursor-pointer gap-3 text-sm">
                <input
                  type="radio"
                  name="packKind"
                  checked={packKind === 'deploy-only'}
                  onChange={() => setPackKind('deploy-only')}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-neutral-100">Deploy pack only</span>
                  <span className="mt-0.5 block text-neutral-400">
                    Production compose, scripts, and config. Pulls prebuilt images from your registry
                    (set <code className="text-neutral-300">API_IMAGE</code> /{' '}
                    <code className="text-neutral-300">WEB_IMAGE</code> in <code className="text-neutral-300">.env</code>).
                    Smaller download.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer gap-3 text-sm">
                <input
                  type="radio"
                  name="packKind"
                  checked={packKind === 'full-source'}
                  onChange={() => setPackKind('full-source')}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-neutral-100">Full source pack</span>
                  <span className="mt-0.5 block text-neutral-400">
                    Includes API, web, and shared source plus Dockerfiles. Build on the server with{' '}
                    <code className="text-neutral-300">USE_LOCAL_BUILD=true ./scripts/install.sh</code>.
                    Larger download.
                  </span>
                </span>
              </label>
            </fieldset>
            <button
              type="button"
              disabled={downloading || !domain}
              onClick={() => void handleDownload()}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              {downloading
                ? 'Generating…'
                : packKind === 'full-source'
                  ? 'Download full source pack'
                  : 'Download deploy pack'}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </section>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="rounded border border-neutral-700 px-4 py-2 text-sm disabled:opacity-40"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900"
            >
              Next
            </button>
          ) : null}
        </div>
      </main>
    </div>
  );
}
