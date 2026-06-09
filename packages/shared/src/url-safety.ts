const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.goog',
]);

function isPrivateIpv4(host: string): boolean {
  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function isPrivateIpv6(host: string): boolean {
  const normalized = host.toLowerCase();
  if (normalized === '::1') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (normalized.startsWith('fe80')) return true;
  return false;
}

export type UrlSafetyOptions = {
  allowLocalhost?: boolean;
};

export type UrlSafetyResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

export function validateOutboundUrl(
  raw: string,
  options: UrlSafetyOptions = {},
): UrlSafetyResult {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, reason: 'Invalid URL' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { ok: false, reason: 'Only http and https URLs are allowed' };
  }

  const host = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(host)) {
    if (options.allowLocalhost && (host === 'localhost' || host === '127.0.0.1' || host === '::1')) {
      return { ok: true, url: parsed };
    }
    return { ok: false, reason: `Blocked hostname: ${host}` };
  }

  if (!options.allowLocalhost && (host === '127.0.0.1' || host === '::1')) {
    return { ok: false, reason: 'Localhost URLs are not allowed' };
  }

  if (isPrivateIpv4(host) || isPrivateIpv6(host)) {
    return { ok: false, reason: 'Private network addresses are not allowed' };
  }

  return { ok: true, url: parsed };
}

export function assertSafeOutboundUrl(raw: string, options?: UrlSafetyOptions): URL {
  const result = validateOutboundUrl(raw, options);
  if (!result.ok) {
    throw new Error(result.reason);
  }
  return result.url;
}

export function hostnameAllowed(urlString: string, allowlist: string[]): boolean {
  if (allowlist.length === 0) return true;
  try {
    const host = new URL(urlString).hostname.toLowerCase();
    return allowlist.some((entry) => entry.toLowerCase() === host);
  } catch {
    return false;
  }
}
