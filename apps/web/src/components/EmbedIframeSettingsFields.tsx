import {
  DEFAULT_EMBED_IFRAME_ALLOW,
  DEFAULT_EMBED_IFRAME_SANDBOX,
  EMBED_IFRAME_ALLOW_OPTIONS,
  EMBED_IFRAME_SANDBOX_OPTIONS,
  formatSemicolonList,
  formatSpaceList,
  parseSemicolonList,
  parseSpaceList,
} from '@movie-streamer/shared';

export type EmbedIframeFormState = {
  sandboxEnabled: boolean;
  sandboxTokens: string[];
  allowFeatures: string[];
};

export const defaultEmbedIframeFormState: EmbedIframeFormState = {
  sandboxEnabled: false,
  sandboxTokens: parseSpaceList(DEFAULT_EMBED_IFRAME_SANDBOX),
  allowFeatures: parseSemicolonList(DEFAULT_EMBED_IFRAME_ALLOW),
};

export function embedIframeFormStateFromConfig(config: {
  iframeSandboxEnabled?: boolean;
  iframeSandboxPolicy?: string;
  iframeAllow?: string;
}): EmbedIframeFormState {
  return {
    sandboxEnabled: config.iframeSandboxEnabled ?? false,
    sandboxTokens: parseSpaceList(config.iframeSandboxPolicy ?? DEFAULT_EMBED_IFRAME_SANDBOX),
    allowFeatures: parseSemicolonList(config.iframeAllow ?? DEFAULT_EMBED_IFRAME_ALLOW),
  };
}

export function embedIframeConfigFromFormState(state: EmbedIframeFormState): {
  iframeSandboxEnabled: boolean;
  iframeSandboxPolicy?: string;
  iframeAllow: string;
} {
  const iframeAllow = formatSemicolonList(state.allowFeatures);
  if (!state.sandboxEnabled) {
    return {
      iframeSandboxEnabled: false,
      iframeAllow,
    };
  }
  return {
    iframeSandboxEnabled: true,
    iframeSandboxPolicy: formatSpaceList(state.sandboxTokens),
    iframeAllow,
  };
}

type EmbedIframeSettingsFieldsProps = {
  value: EmbedIframeFormState;
  onChange: (value: EmbedIframeFormState) => void;
};

function toggleItem(list: string[], item: string, checked: boolean): string[] {
  if (checked) {
    return list.includes(item) ? list : [...list, item];
  }
  return list.filter((entry) => entry !== item);
}

export function EmbedIframeSettingsFields({ value, onChange }: EmbedIframeSettingsFieldsProps) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-neutral-800/80 bg-neutral-950/30 p-4">
      <legend className="px-1 text-sm font-medium">Iframe playback</legend>

      <div className="space-y-2">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={value.sandboxEnabled}
            onChange={(e) => onChange({ ...value, sandboxEnabled: e.target.checked })}
          />
          <span>
            <span className="font-medium">Enable sandbox</span>
            <span className="mt-1 block text-xs text-[var(--color-muted)]">
              Restricts what the embedded page can do inside the iframe. Safer for unknown hosts.
              Most embed APIs (vidlink, vidsrc) expect this <strong className="font-normal">off</strong>{' '}
              — turn on only if you trust the host or see a “disable sandbox” message.
            </span>
          </span>
        </label>
      </div>

      {value.sandboxEnabled && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            Sandbox allow list
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {EMBED_IFRAME_SANDBOX_OPTIONS.map((option) => (
              <label key={option.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={value.sandboxTokens.includes(option.id)}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      sandboxTokens: toggleItem(value.sandboxTokens, option.id, e.target.checked),
                    })
                  }
                />
                <span>
                  <span className="font-mono text-xs">{option.id}</span>
                  <span className="mt-0.5 block text-xs text-[var(--color-muted)]">{option.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
          Feature allow list
        </p>
        <p className="text-xs text-[var(--color-muted)]">
          Browser permissions passed to the iframe via the <code className="text-neutral-400">allow</code>{' '}
          attribute. Usually leave autoplay and fullscreen on for video players.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {EMBED_IFRAME_ALLOW_OPTIONS.map((option) => (
            <label key={option.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={value.allowFeatures.includes(option.id)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    allowFeatures: toggleItem(value.allowFeatures, option.id, e.target.checked),
                  })
                }
              />
              <span>
                <span>{option.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--color-muted)]">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
