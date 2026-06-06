import { z } from 'zod';
import type { MediaRef } from './schemas/media-ref.js';

export const SAMPLE_MOVIE_MEDIA_REF: MediaRef = {
  provider: 'tmdb',
  type: 'movie',
  id: '550',
};

export const SAMPLE_TV_EPISODE_MEDIA_REF: MediaRef = {
  provider: 'tmdb',
  type: 'episode',
  id: '1399',
  season: 1,
  episode: 1,
};

export function isTvMediaRef(mediaRef: MediaRef): boolean {
  return mediaRef.type === 'tv' || mediaRef.type === 'episode';
}

export function interpolateEmbedTemplate(template: string, mediaRef: MediaRef): string {
  const season = mediaRef.season != null ? String(mediaRef.season) : '';
  const episode = mediaRef.episode != null ? String(mediaRef.episode) : '';

  return template
    .replaceAll('{id}', encodeURIComponent(mediaRef.id))
    .replaceAll('{type}', encodeURIComponent(mediaRef.type))
    .replaceAll('{season}', encodeURIComponent(season))
    .replaceAll('{episode}', encodeURIComponent(episode));
}

export function assertValidEmbedUrlAfterInterpolation(template: string, mediaRef: MediaRef): string {
  const url = interpolateEmbedTemplate(template, mediaRef);
  return z.string().url().parse(url);
}

export function resolveEmbedUrlForMediaRef(
  config: { movieUrlTemplate: string; tvUrlTemplate?: string },
  mediaRef: MediaRef,
): string | null {
  const template = isTvMediaRef(mediaRef) ? config.tvUrlTemplate : config.movieUrlTemplate;
  if (!template) {
    return null;
  }
  return interpolateEmbedTemplate(template, mediaRef);
}
