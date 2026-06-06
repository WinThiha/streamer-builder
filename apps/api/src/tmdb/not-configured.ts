export class TmdbNotConfiguredError extends Error {
  constructor() {
    super('TMDB is not configured');
    this.name = 'TmdbNotConfiguredError';
  }
}
