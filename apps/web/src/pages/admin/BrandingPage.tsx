import {
  HOMEPAGE_CATEGORY_LABELS,
  type LogoConfig,
  type SiteConfig,
  type SiteTheme,
} from '@movie-streamer/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useRef, useState } from 'react';
import {
  fetchAdminSiteConfig,
  patchSiteConfigDraft,
  uploadSiteLogo,
  apiUrl,
} from '../../lib/api';

const THEME_FIELDS: Array<{ key: keyof SiteTheme; label: string }> = [
  { key: 'background', label: 'Background' },
  { key: 'foreground', label: 'Foreground' },
  { key: 'primary', label: 'Primary' },
  { key: 'muted', label: 'Muted' },
  { key: 'surface', label: 'Surface' },
];

function logoPreviewSrc(logo: LogoConfig | undefined): string | null {
  if (!logo) return null;
  if (logo.kind === 'url') return logo.url;
  return apiUrl(logo.url);
}

export function BrandingPage() {
  const queryClient = useQueryClient();
  const { data: adminData, isLoading } = useQuery({
    queryKey: ['site', 'config', 'admin'],
    queryFn: fetchAdminSiteConfig,
  });

  const [draft, setDraft] = useState<SiteConfig | null>(null);
  const [logoMode, setLogoMode] = useState<'none' | 'url' | 'upload'>('none');
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const logoFileInputId = useId();
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adminData?.draft) {
      setDraft(adminData.draft);
      const logo = adminData.draft.identity.logo;
      if (!logo) {
        setLogoMode('none');
        setLogoUrl('');
      } else if (logo.kind === 'url') {
        setLogoMode('url');
        setLogoUrl(logo.url);
      } else {
        setLogoMode('upload');
        setLogoUrl('');
      }
    }
  }, [adminData?.draft]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error('No draft loaded');
      let logo: LogoConfig | undefined;
      if (logoMode === 'url' && logoUrl.trim()) {
        logo = { kind: 'url', url: logoUrl.trim() };
      } else if (logoMode === 'upload' && adminData?.draft.identity.logo?.kind === 'uploaded') {
        logo = adminData.draft.identity.logo;
      }
      return patchSiteConfigDraft({
        identity: {
          siteName: draft.identity.siteName,
          logo,
        },
        theme: draft.theme,
      });
    },
    onSuccess: () => {
      setMessage('Draft saved.');
      void queryClient.invalidateQueries({ queryKey: ['site'] });
    },
    onError: (err) => setMessage((err as Error).message),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadSiteLogo,
    onSuccess: () => {
      setMessage('Logo uploaded to draft.');
      setLogoMode('upload');
      void queryClient.invalidateQueries({ queryKey: ['site'] });
    },
    onError: (err) => {
      setMessage((err as Error).message);
      setSelectedFileName(null);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    },
  });

  if (isLoading || !draft) {
    return <p className="text-[var(--color-muted)]">Loading branding…</p>;
  }

  const previewLogo =
    logoMode === 'url' && logoUrl
      ? logoUrl
      : logoPreviewSrc(
          logoMode === 'upload' ? adminData?.draft.identity.logo : undefined,
        );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Branding</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Changes apply to draft until you publish from the admin header.
        </p>
      </div>

      {message && <p className="text-sm text-[var(--color-muted)]">{message}</p>}

      <section className="space-y-4 rounded-lg border border-neutral-800 p-4">
        <h2 className="font-medium">Site name</h2>
        <input
          type="text"
          value={draft.identity.siteName}
          onChange={(e) =>
            setDraft({
              ...draft,
              identity: { ...draft.identity, siteName: e.target.value },
            })
          }
          className="w-full max-w-md rounded border border-neutral-700 bg-[var(--color-surface)] px-3 py-2"
        />
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-800 p-4">
        <h2 className="font-medium">Logo</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          {(['none', 'url', 'upload'] as const).map((mode) => (
            <label key={mode} className="flex items-center gap-2">
              <input
                type="radio"
                name="logoMode"
                checked={logoMode === mode}
                onChange={() => setLogoMode(mode)}
              />
              {mode === 'none' ? 'No logo' : mode === 'url' ? 'External URL' : 'Upload to server'}
            </label>
          ))}
        </div>
        {logoMode === 'url' && (
          <input
            type="url"
            placeholder="https://example.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full max-w-lg rounded border border-neutral-700 bg-[var(--color-surface)] px-3 py-2"
          />
        )}
        {logoMode === 'upload' && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--color-muted)]">
              PNG, JPEG, or WebP. Upload saves to the server and updates your draft logo.
            </p>
            <input
              ref={logoFileInputRef}
              id={logoFileInputId}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setSelectedFileName(file.name);
                uploadMutation.mutate(file);
              }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor={logoFileInputId}
                className={`inline-flex cursor-pointer items-center rounded border border-neutral-600 bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:bg-neutral-800 focus-within:ring-2 focus-within:ring-[var(--color-primary)] ${uploadMutation.isPending ? 'pointer-events-none opacity-60' : ''}`}
              >
                {uploadMutation.isPending ? 'Uploading…' : 'Choose image file'}
              </label>
              {selectedFileName && !uploadMutation.isPending && (
                <span className="text-sm text-[var(--color-muted)]">{selectedFileName}</span>
              )}
            </div>
          </div>
        )}
        {previewLogo && (
          <img src={previewLogo} alt="" className="h-12 w-auto object-contain" />
        )}
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-800 p-4">
        <h2 className="font-medium">Theme colors</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {THEME_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <span className="w-24">{label}</span>
              <input
                type="color"
                value={draft.theme[key] as string}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    theme: { ...draft.theme, [key]: e.target.value },
                  })
                }
              />
              <input
                type="text"
                value={draft.theme[key] as string}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    theme: { ...draft.theme, [key]: e.target.value },
                  })
                }
                className="flex-1 rounded border border-neutral-700 bg-[var(--color-surface)] px-2 py-1 font-mono text-xs"
              />
            </label>
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

      <p className="text-xs text-[var(--color-muted)]">
        Homepage categories: {Object.keys(HOMEPAGE_CATEGORY_LABELS).join(', ')} — configure on Homepage tab.
      </p>
    </div>
  );
}
