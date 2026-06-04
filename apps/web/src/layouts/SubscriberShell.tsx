import { Link, Outlet } from 'react-router-dom';
import { useSiteConfig } from '../providers/SiteConfigProvider';
import { apiUrl } from '../lib/api';
import type { LogoConfig } from '@movie-streamer/shared';

function resolveLogoSrc(logo: LogoConfig): string {
  if (logo.kind === 'url') {
    return logo.url;
  }
  const path = logo.url.startsWith('/') ? logo.url : `/${logo.url}`;
  return apiUrl(path);
}

export function SubscriberShell() {
  const { config } = useSiteConfig();
  const siteName = config?.identity.siteName ?? 'Movie Streamer';
  const logo = config?.identity.logo;

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4 text-sm">
          <Link to="/" className="flex items-center gap-2 font-semibold text-[var(--color-foreground)]">
            {logo && (
              <img
                src={resolveLogoSrc(logo)}
                alt=""
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            )}
            <span>{siteName}</span>
          </Link>
          <Link to="/search" className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
            Search
          </Link>
          <Link to="/about" className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
            About
          </Link>
          <Link to="/admin" className="ml-auto text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
            Admin
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
