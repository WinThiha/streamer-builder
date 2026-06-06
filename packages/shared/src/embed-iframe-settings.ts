/** Default iframe `allow` attribute for embed playback. */
export const DEFAULT_EMBED_IFRAME_ALLOW =
  'autoplay; fullscreen; encrypted-media; picture-in-picture';

/** Default iframe `sandbox` tokens when sandbox is enabled. */
export const DEFAULT_EMBED_IFRAME_SANDBOX =
  'allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox';

export const EMBED_IFRAME_ALLOW_OPTIONS = [
  {
    id: 'autoplay',
    label: 'Autoplay',
    hint: 'Lets the player start without a click (may still be blocked by the browser).',
  },
  {
    id: 'fullscreen',
    label: 'Fullscreen',
    hint: 'Allows the fullscreen button inside the embed.',
  },
  {
    id: 'encrypted-media',
    label: 'Encrypted media',
    hint: 'Needed for some DRM or protected streams inside the embed.',
  },
  {
    id: 'picture-in-picture',
    label: 'Picture-in-picture',
    hint: 'Allows PiP mode where the browser supports it.',
  },
] as const;

export const EMBED_IFRAME_SANDBOX_OPTIONS = [
  {
    id: 'allow-scripts',
    label: 'Scripts',
    hint: 'Required for almost all embed players to run JavaScript.',
  },
  {
    id: 'allow-same-origin',
    label: 'Same origin',
    hint: 'Lets the embed access its own origin; usually required with scripts.',
  },
  {
    id: 'allow-presentation',
    label: 'Presentation',
    hint: 'Allows fullscreen / presentation APIs inside the sandbox.',
  },
  {
    id: 'allow-popups',
    label: 'Popups',
    hint: 'Allows window.open from the embed (ads or provider UI).',
  },
  {
    id: 'allow-popups-to-escape-sandbox',
    label: 'Popups escape sandbox',
    hint: 'Popups open without sandbox restrictions; some providers need this.',
  },
  {
    id: 'allow-forms',
    label: 'Forms',
    hint: 'Allows form submission inside the embed.',
  },
] as const;

export type EmbedIframeSettings = {
  sandboxEnabled: boolean;
  sandboxPolicy?: string;
  allow: string;
};

export function resolveEmbedIframeSettings(config: {
  iframeSandboxEnabled?: boolean;
  iframeSandboxPolicy?: string;
  iframeAllow?: string;
}): EmbedIframeSettings {
  const sandboxEnabled = config.iframeSandboxEnabled ?? false;
  return {
    sandboxEnabled,
    ...(sandboxEnabled
      ? {
          sandboxPolicy: config.iframeSandboxPolicy?.trim() || DEFAULT_EMBED_IFRAME_SANDBOX,
        }
      : {}),
    allow: config.iframeAllow?.trim() || DEFAULT_EMBED_IFRAME_ALLOW,
  };
}

export function parseSemicolonList(value: string): string[] {
  return value
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatSemicolonList(items: string[]): string {
  return items.join('; ');
}

export function parseSpaceList(value: string): string[] {
  return value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatSpaceList(items: string[]): string {
  return items.join(' ');
}
