/** Build-time hint from Vite env; runtime mode comes from API `/health` via AppModeProvider. */
export function isPrototypeBuildMode(): boolean {
  return import.meta.env.VITE_APP_MODE === 'prototype';
}
