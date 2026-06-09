import { Link, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEffectiveSiteConfig } from '../hooks/useEffectiveSiteConfig';
import { useAppPath } from '../providers/RouteBaseProvider';
import { apiUrl } from '../lib/api';
import type { LogoConfig } from '@movie-streamer/shared';

function resolveLogoSrc(logo: LogoConfig): string {
  if (logo.kind === 'url') return logo.url;
  const path = logo.url.startsWith('/') ? logo.url : `/${logo.url}`;
  return apiUrl(path);
}

export function PrototypeSubscriberShell({ children }: { children: ReactNode }) {
  const { preset } = useParams<{ preset: string }>();
  const configurePath = preset ? `/configure?preset=${preset}` : '/configure';
  const { config } = useEffectiveSiteConfig();
  const homePath = useAppPath('/');
  const searchPath = useAppPath('/search');
  const aboutPath = useAppPath('/about');
  const siteName = config?.identity.siteName ?? 'Movie Streamer';
  const logo = config?.identity.logo;

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4 text-sm">
          <Link to={homePath} className="flex items-center gap-2 font-semibold text-[var(--color-foreground)]">
            {logo && (
              <img
                src={resolveLogoSrc(logo)}
                alt=""
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            )}
            <span>{siteName}</span>
          </Link>
          <Link to={searchPath} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
            Search
          </Link>
          <Link to={aboutPath} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
            About
          </Link>
          <Link
            to={configurePath}
            className="ml-auto text-[var(--color-primary)] hover:text-[var(--color-foreground)]"
          >
            Configure & download
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
