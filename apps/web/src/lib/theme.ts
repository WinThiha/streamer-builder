import type { SiteTheme } from '@movie-streamer/shared';
import type { CSSProperties } from 'react';

export function siteThemeStyle(theme: SiteTheme): CSSProperties {
  return {
    '--color-background': theme.background,
    '--color-foreground': theme.foreground,
    '--color-primary': theme.primary,
    '--color-muted': theme.muted,
    '--color-surface': theme.surface,
    ...(theme.fontSans ? { '--font-sans': theme.fontSans } : {}),
    backgroundColor: theme.background,
    color: theme.foreground,
    fontFamily: theme.fontSans,
  } as CSSProperties;
}

/** Apply theme tokens on an element (defaults to document root for the live site). */
export function applySiteTheme(theme: SiteTheme, element: HTMLElement = document.documentElement): void {
  element.style.setProperty('--color-background', theme.background);
  element.style.setProperty('--color-foreground', theme.foreground);
  element.style.setProperty('--color-primary', theme.primary);
  element.style.setProperty('--color-muted', theme.muted);
  element.style.setProperty('--color-surface', theme.surface);
  if (theme.fontSans) {
    element.style.setProperty('--font-sans', theme.fontSans);
  }
}

/** Map site brand colors to shadcn CSS variables for admin UI. */
export function applyShadcnTheme(theme: SiteTheme, element: HTMLElement): void {
  element.style.setProperty('--background', theme.background);
  element.style.setProperty('--foreground', theme.foreground);
  element.style.setProperty('--primary', theme.primary);
  element.style.setProperty('--primary-foreground', theme.foreground);
  element.style.setProperty('--muted', theme.surface);
  element.style.setProperty('--muted-foreground', theme.muted);
  element.style.setProperty('--card', theme.surface);
  element.style.setProperty('--card-foreground', theme.foreground);
  element.style.setProperty('--popover', theme.surface);
  element.style.setProperty('--popover-foreground', theme.foreground);
  element.style.setProperty('--accent', theme.surface);
  element.style.setProperty('--accent-foreground', theme.foreground);
  element.style.setProperty('--border', theme.muted);
  element.style.setProperty('--input', theme.muted);
  element.style.setProperty('--ring', theme.primary);
}
