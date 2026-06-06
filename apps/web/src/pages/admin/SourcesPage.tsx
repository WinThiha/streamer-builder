import {
  embedConnectorConfigSchema,
  resolveEmbedUrlForMediaRef,
  type EmbedConnectorConfig,
  type MediaRef,
} from '@movie-streamer/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createConnector,
  deleteConnector,
  fetchConnectors,
  testConnector,
  updateConnector,
  type ConnectorRecord,
} from '../../lib/api';
import { Button } from '@/components/ui/button';
import {
  defaultEmbedIframeFormState,
  embedIframeConfigFromFormState,
  embedIframeFormStateFromConfig,
  EmbedIframeSettingsFields,
  type EmbedIframeFormState,
} from '../../components/EmbedIframeSettingsFields';

const DEFAULT_MOVIE_TEMPLATE = 'https://vidsrc.to/embed/movie/{id}';
const DEFAULT_TV_TEMPLATE = 'https://vidsrc.to/embed/tv/{id}/{season}/{episode}';

function isEmbedConfig(config: unknown): config is EmbedConnectorConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'kind' in config &&
    (config as EmbedConnectorConfig).kind === 'embed'
  );
}

function buildTestMediaRef(
  mediaType: 'movie' | 'tv',
  tmdbId: string,
  season: string,
  episode: string,
): MediaRef {
  if (mediaType === 'movie') {
    return { provider: 'tmdb', type: 'movie', id: tmdbId };
  }
  return {
    provider: 'tmdb',
    type: 'episode',
    id: tmdbId,
    season: Number(season) || 1,
    episode: Number(episode) || 1,
  };
}

function templateFieldErrors(error: {
  issues: Array<{ path: (string | number)[]; message: string }>;
}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !out[key]) {
      out[key] = issue.message;
    }
  }
  return out;
}

export function SourcesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'connectors'],
    queryFn: fetchConnectors,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [movieUrlTemplate, setMovieUrlTemplate] = useState(DEFAULT_MOVIE_TEMPLATE);
  const [tvUrlTemplate, setTvUrlTemplate] = useState(DEFAULT_TV_TEMPLATE);
  const [sourceLabel, setSourceLabel] = useState('');
  const [priority, setPriority] = useState('100');
  const [enabled, setEnabled] = useState(true);
  const [testMediaType, setTestMediaType] = useState<'movie' | 'tv'>('movie');
  const [testTmdbId, setTestTmdbId] = useState('550');
  const [testSeason, setTestSeason] = useState('1');
  const [testEpisode, setTestEpisode] = useState('1');
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    sources: Array<{ url: string; label: string; kind: string }>;
    error?: string;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [iframeSettings, setIframeSettings] = useState<EmbedIframeFormState>(defaultEmbedIframeFormState);

  const connectors = data?.connectors ?? [];
  const selected = connectors.find((c) => c.id === selectedId) ?? null;
  const isNew = selectedId === '__new__';

  useEffect(() => {
    if (isNew) {
      setLabel('');
      setMovieUrlTemplate(DEFAULT_MOVIE_TEMPLATE);
      setTvUrlTemplate(DEFAULT_TV_TEMPLATE);
      setSourceLabel('');
      setPriority('100');
      setEnabled(true);
      setTestResult(null);
      setFormError(null);
      setIframeSettings(defaultEmbedIframeFormState);
      return;
    }
    if (!selected || selected.kind !== 'embed' || !isEmbedConfig(selected.config)) {
      return;
    }
    setLabel(selected.label);
    setMovieUrlTemplate(selected.config.movieUrlTemplate);
    setTvUrlTemplate(selected.config.tvUrlTemplate ?? '');
    setSourceLabel(selected.config.sourceLabel ?? '');
    setPriority(String(selected.priority));
    setEnabled(selected.enabled);
    setTestResult(null);
    setFormError(null);
    setIframeSettings(embedIframeFormStateFromConfig(selected.config));
  }, [selected, isNew]);

  const previewMediaRef = useMemo(
    () => buildTestMediaRef(testMediaType, testTmdbId, testSeason, testEpisode),
    [testMediaType, testTmdbId, testSeason, testEpisode],
  );

  const embedConfigDraft = useMemo(
    () => ({
      kind: 'embed' as const,
      movieUrlTemplate,
      ...(tvUrlTemplate.trim() ? { tvUrlTemplate: tvUrlTemplate.trim() } : {}),
    }),
    [movieUrlTemplate, tvUrlTemplate],
  );

  const embedValidation = useMemo(
    () => embedConnectorConfigSchema.safeParse(embedConfigDraft),
    [embedConfigDraft],
  );

  const templateErrors = useMemo(
    () => (embedValidation.success ? {} : templateFieldErrors(embedValidation.error)),
    [embedValidation],
  );

  const previewUrl = useMemo(() => {
    try {
      return resolveEmbedUrlForMediaRef(
        {
          movieUrlTemplate,
          tvUrlTemplate: tvUrlTemplate.trim() || undefined,
        },
        previewMediaRef,
      );
    } catch {
      return null;
    }
  }, [movieUrlTemplate, tvUrlTemplate, previewMediaRef]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = embedConnectorConfigSchema.safeParse(embedConfigDraft);
      if (!parsed.success) {
        throw new Error(
          Object.values(templateFieldErrors(parsed.error)).join(' · ') ||
            'Invalid embed connector config',
        );
      }

      const config: EmbedConnectorConfig = {
        ...parsed.data,
        ...(sourceLabel.trim() ? { sourceLabel: sourceLabel.trim() } : {}),
        ...embedIframeConfigFromFormState(iframeSettings),
      };
      const priorityNum = Number(priority) || 100;

      if (isNew) {
        return createConnector({
          label: label.trim(),
          kind: 'embed',
          enabled,
          priority: priorityNum,
          config,
        });
      }
      if (!selectedId) throw new Error('No connector selected');
      return updateConnector(selectedId, {
        label: label.trim(),
        enabled,
        priority: priorityNum,
        config,
      });
    },
    onSuccess: async (result) => {
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'connectors'] });
      setSelectedId(result.connector.id);
    },
    onError: (err) => setFormError((err as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteConnector(selectedId!),
    onSuccess: async () => {
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'connectors'] });
    },
    onError: (err) => setFormError((err as Error).message),
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const connectorId = isNew ? null : selectedId;
      if (!connectorId) {
        throw new Error('Save the connector before testing');
      }
      return testConnector(connectorId, previewMediaRef);
    },
    onSuccess: (result) => {
      setTestResult({
        ok: result.ok,
        sources: result.sources,
        error: result.error,
      });
    },
    onError: (err) =>
      setTestResult({
        ok: false,
        sources: [],
        error: (err as Error).message,
      }),
  });

  function handleSelect(connector: ConnectorRecord) {
    if (connector.kind !== 'embed') {
      setSelectedId(connector.id);
      setFormError('This mini UI edits embed connectors only. Use the API for other kinds.');
      return;
    }
    setSelectedId(connector.id);
    setFormError(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Sources</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Configure separate embed URL patterns for movies and TV. Many providers use different
          paths for each (e.g. vidsrc.to).
        </p>
      </div>

      {isLoading && <p className="text-sm text-[var(--color-muted)]">Loading connectors…</p>}
      {isError && <p className="text-sm text-red-400">{(error as Error).message}</p>}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Connectors</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedId('__new__')}>
              Add embed
            </Button>
          </div>
          <ul className="space-y-2">
            {connectors.map((connector) => (
              <li key={connector.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(connector)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    selectedId === connector.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{connector.label}</span>
                    <span
                      className={`shrink-0 text-[10px] uppercase ${connector.enabled ? 'text-green-400' : 'text-neutral-500'}`}
                    >
                      {connector.enabled ? 'on' : 'off'}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
                    {connector.kind} · priority {connector.priority}
                  </p>
                </button>
              </li>
            ))}
            {connectors.length === 0 && !isLoading && (
              <li className="text-sm text-[var(--color-muted)]">No connectors yet.</li>
            )}
          </ul>
        </section>

        <section className="space-y-6">
          {!selectedId && (
            <p className="text-sm text-[var(--color-muted)]">
              Select a connector or add a new embed source.
            </p>
          )}

          {selectedId && selected?.kind !== 'embed' && !isNew && (
            <p className="text-sm text-amber-200">
              <strong>{selected?.label}</strong> is a {selected?.kind} connector. Edit it via the
              admin API or add a new embed connector here.
            </p>
          )}

          {(isNew || selected?.kind === 'embed') && (
            <form
              className="space-y-4 rounded-lg border border-neutral-800 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
            >
              <h2 className="text-sm font-medium">{isNew ? 'New embed connector' : 'Edit embed connector'}</h2>

              <label className="block space-y-1 text-sm">
                <span>Label</span>
                <input
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="My embed player"
                  className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span>Movie URL template</span>
                <input
                  required
                  value={movieUrlTemplate}
                  onChange={(e) => setMovieUrlTemplate(e.target.value)}
                  placeholder={DEFAULT_MOVIE_TEMPLATE}
                  aria-invalid={Boolean(templateErrors.movieUrlTemplate)}
                  className={`w-full rounded border bg-neutral-900 px-3 py-2 font-mono text-xs ${
                    templateErrors.movieUrlTemplate
                      ? 'border-red-500'
                      : 'border-neutral-700'
                  }`}
                />
              </label>
              {templateErrors.movieUrlTemplate && (
                <p className="text-sm text-red-400">{templateErrors.movieUrlTemplate}</p>
              )}
              <p className="text-xs text-[var(--color-muted)]">
                Placeholders: {'{id}'}, {'{type}'}. Must be a valid URL after replacing placeholders
                (host reachability is not checked). Example:{' '}
                <code className="text-neutral-300">https://vidlink.pro/movie/{'{id}'}</code>
              </p>

              <label className="block space-y-1 text-sm">
                <span>TV URL template (optional)</span>
                <input
                  value={tvUrlTemplate}
                  onChange={(e) => setTvUrlTemplate(e.target.value)}
                  placeholder={DEFAULT_TV_TEMPLATE}
                  aria-invalid={Boolean(templateErrors.tvUrlTemplate)}
                  className={`w-full rounded border bg-neutral-900 px-3 py-2 font-mono text-xs ${
                    templateErrors.tvUrlTemplate ? 'border-red-500' : 'border-neutral-700'
                  }`}
                />
              </label>
              {templateErrors.tvUrlTemplate && (
                <p className="text-sm text-red-400">{templateErrors.tvUrlTemplate}</p>
              )}
              <p className="text-xs text-[var(--color-muted)]">
                Used for TV episodes. Include {'{id}'}, {'{season}'}, {'{episode}'}. Example:{' '}
                <code className="text-neutral-300">
                  https://vidlink.pro/tv/{'{id}'}/{'{season}'}/{'{episode}'}
                </code>
              </p>

              <EmbedIframeSettingsFields value={iframeSettings} onChange={setIframeSettings} />

              <label className="block space-y-1 text-sm">
                <span>Source label (optional)</span>
                <input
                  value={sourceLabel}
                  onChange={(e) => setSourceLabel(e.target.value)}
                  placeholder="Defaults to connector label"
                  className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1 text-sm">
                  <span>Priority</span>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                  />
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                  />
                  Enabled
                </label>
              </div>

              {formError && <p className="text-sm text-red-400">{formError}</p>}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={saveMutation.isPending || !embedValidation.success}
                >
                  {saveMutation.isPending ? 'Saving…' : 'Save'}
                </Button>
                {!isNew && selectedId && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (window.confirm('Delete this connector?')) {
                        deleteMutation.mutate();
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </form>
          )}

          {(isNew || selected?.kind === 'embed') && (
            <div className="space-y-4 rounded-lg border border-neutral-800 p-4">
              <h2 className="text-sm font-medium">Test</h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1 text-sm">
                  <span>Media type</span>
                  <select
                    value={testMediaType}
                    onChange={(e) => setTestMediaType(e.target.value as 'movie' | 'tv')}
                    className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                  >
                    <option value="movie">Movie</option>
                    <option value="tv">TV episode</option>
                  </select>
                </label>
                <label className="block space-y-1 text-sm">
                  <span>TMDB id</span>
                  <input
                    value={testTmdbId}
                    onChange={(e) => setTestTmdbId(e.target.value)}
                    className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                  />
                </label>
                {testMediaType === 'tv' && (
                  <>
                    <label className="block space-y-1 text-sm">
                      <span>Season</span>
                      <input
                        value={testSeason}
                        onChange={(e) => setTestSeason(e.target.value)}
                        className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                      />
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span>Episode</span>
                      <input
                        value={testEpisode}
                        onChange={(e) => setTestEpisode(e.target.value)}
                        className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                      />
                    </label>
                  </>
                )}
              </div>

              {previewUrl ? (
                <div className="rounded border border-neutral-800 bg-neutral-950/50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Preview URL
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-neutral-200">{previewUrl}</p>
                </div>
              ) : (
                testMediaType === 'tv' &&
                !tvUrlTemplate.trim() && (
                  <p className="text-sm text-amber-200">
                    Add a TV URL template to test TV episodes.
                  </p>
                )
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={testMutation.isPending || isNew}
                  onClick={() => testMutation.mutate()}
                >
                  {testMutation.isPending ? 'Testing…' : 'Test saved connector'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!previewUrl}
                  onClick={() =>
                    navigate('/play', {
                      state: {
                        mediaRef: previewMediaRef,
                        title: `Test · TMDB ${testTmdbId}`,
                      },
                    })
                  }
                >
                  Open in Play
                </Button>
              </div>

              {isNew && (
                <p className="text-xs text-[var(--color-muted)]">Save the connector before running a server test.</p>
              )}

              {testResult && (
                <div
                  className={`rounded border p-3 text-sm ${
                    testResult.ok && testResult.sources.length > 0
                      ? 'border-green-900/50 bg-green-950/20 text-green-200'
                      : 'border-red-900/50 bg-red-950/20 text-red-200'
                  }`}
                >
                  {testResult.ok && testResult.sources.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-green-300/80">
                        URL generated successfully. The embed host was not contacted — open in Play
                        or a new tab to verify playback.
                      </p>
                      <ul className="space-y-2">
                        {testResult.sources.map((source) => (
                          <li key={source.url}>
                            <span className="font-medium">{source.label}</span>{' '}
                            <span className="text-xs uppercase">({source.kind})</span>
                            <p className="mt-1 break-all font-mono text-xs">{source.url}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>
                      {testResult.error ??
                        (testResult.sources.length === 0
                          ? 'No sources returned (check the template for this media type).'
                          : 'Test failed')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
