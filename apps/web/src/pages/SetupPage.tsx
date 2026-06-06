import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { completeSetup } from '../lib/api';
import { Button } from '@/components/ui/button';

const DEFAULT_MOVIE_TEMPLATE = 'https://vidsrc.to/embed/movie/{id}';
const DEFAULT_TV_TEMPLATE = 'https://vidsrc.to/embed/tv/{id}/{season}/{episode}';

export function SetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [addConnector, setAddConnector] = useState(false);
  const [connectorLabel, setConnectorLabel] = useState('');
  const [connectorKind, setConnectorKind] = useState<'embed' | 'http' | 'manual'>('embed');
  const [movieUrlTemplate, setMovieUrlTemplate] = useState(DEFAULT_MOVIE_TEMPLATE);
  const [tvUrlTemplate, setTvUrlTemplate] = useState(DEFAULT_TV_TEMPLATE);
  const [resolveUrl, setResolveUrl] = useState('');
  const [manualUrl, setManualUrl] = useState('');

  const mutation = useMutation({
    mutationFn: completeSetup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['setup'] });
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      navigate('/admin/login');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (adminPassword !== confirmPassword) {
      mutation.reset();
      return;
    }

    const payload: Parameters<typeof completeSetup>[0] = {
      adminPassword,
      tmdbApiKey,
    };

    if (addConnector && connectorLabel) {
      if (connectorKind === 'embed' && movieUrlTemplate) {
        payload.connector = {
          label: connectorLabel,
          kind: 'embed',
          config: {
            kind: 'embed',
            movieUrlTemplate,
            ...(tvUrlTemplate.trim() ? { tvUrlTemplate: tvUrlTemplate.trim() } : {}),
          },
        };
      } else if (connectorKind === 'http' && resolveUrl) {
        payload.connector = {
          label: connectorLabel,
          kind: 'http',
          config: { kind: 'http', resolveUrl },
        };
      } else if (connectorKind === 'manual' && manualUrl) {
        payload.connector = {
          label: connectorLabel,
          kind: 'manual',
          config: {
            kind: 'manual',
            sources: [
              {
                id: 'setup-manual-1',
                label: connectorLabel,
                kind: 'hls',
                url: manualUrl,
              },
            ],
          },
        };
      }
    }

    mutation.mutate(payload);
  }

  const passwordMismatch = confirmPassword.length > 0 && adminPassword !== confirmPassword;

  return (
    <div className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-semibold">First-run setup</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Create your admin account, add your TMDB API key, and optionally configure your first
          content connector.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Admin account</legend>
            <input
              type="password"
              required
              minLength={8}
              placeholder="Admin password (min 8 characters)"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
            {passwordMismatch && (
              <p className="text-sm text-red-400">Passwords do not match.</p>
            )}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">TMDB API key</legend>
            <input
              type="password"
              required
              placeholder="TMDB API key"
              value={tmdbApiKey}
              onChange={(e) => setTmdbApiKey(e.target.value)}
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
            <p className="text-xs text-neutral-500">
              Get a key at themoviedb.org. Stored server-side only.
            </p>
          </fieldset>

          <fieldset className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={addConnector}
                onChange={(e) => setAddConnector(e.target.checked)}
              />
              Add first connector (optional)
            </label>
            {addConnector && (
              <div className="space-y-3 rounded border border-neutral-800 p-4">
                <input
                  type="text"
                  placeholder="Connector label"
                  value={connectorLabel}
                  onChange={(e) => setConnectorLabel(e.target.value)}
                  className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                />
                <select
                  value={connectorKind}
                  onChange={(e) =>
                    setConnectorKind(e.target.value as 'embed' | 'http' | 'manual')
                  }
                  className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                >
                  <option value="embed">Embed URL template (recommended)</option>
                  <option value="http">HTTP resolver</option>
                  <option value="manual">Manual static URL</option>
                </select>
                {connectorKind === 'embed' ? (
                  <>
                    <input
                      type="text"
                      placeholder={DEFAULT_MOVIE_TEMPLATE}
                      value={movieUrlTemplate}
                      onChange={(e) => setMovieUrlTemplate(e.target.value)}
                      className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs"
                    />
                    <input
                      type="text"
                      placeholder={DEFAULT_TV_TEMPLATE}
                      value={tvUrlTemplate}
                      onChange={(e) => setTvUrlTemplate(e.target.value)}
                      className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs"
                    />
                    <p className="text-xs text-neutral-500">
                      Movie template uses {'{id}'}. TV template uses {'{id}'}, {'{season}'},{' '}
                      {'{episode}'}.
                    </p>
                  </>
                ) : connectorKind === 'http' ? (
                  <input
                    type="url"
                    placeholder="https://your-resolver.example/resolve"
                    value={resolveUrl}
                    onChange={(e) => setResolveUrl(e.target.value)}
                    className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                  />
                ) : (
                  <input
                    type="url"
                    placeholder="https://example.com/stream.m3u8"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
                  />
                )}
              </div>
            )}
          </fieldset>

          {mutation.isError && (
            <p className="text-sm text-red-400">{(mutation.error as Error).message}</p>
          )}

          <Button type="submit" disabled={mutation.isPending || passwordMismatch}>
            {mutation.isPending ? 'Saving…' : 'Complete setup'}
          </Button>
        </form>
      </div>
    </div>
  );
}
