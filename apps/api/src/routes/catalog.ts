import { Hono } from 'hono';
import {
  mapMovieDetail,
  mapSearchResults,
  mapSeasonDetail,
  mapTvDetail,
} from '../catalog/mappers.js';
import { buildCatalogHome } from '../catalog/home-builder.js';
import { getPublishedSiteConfig } from '../site-config/repository.js';
import { TmdbClient, TmdbError } from '../tmdb/client.js';
import { createTmdbClient } from '../tmdb/runtime.js';
import { TmdbNotConfiguredError } from '../tmdb/not-configured.js';
import { defaultSiteConfig } from '@movie-streamer/shared';

export const catalogRoutes = new Hono();

async function withTmdbClient<T>(fn: (client: TmdbClient) => Promise<T>): Promise<T> {
  const client = await createTmdbClient();
  return fn(client);
}

function handleCatalogError(
  c: { json: (body: unknown, status?: number) => Response },
  err: unknown,
) {
  if (err instanceof TmdbNotConfiguredError) {
    return c.json({ error: 'Catalog service unavailable' }, 503);
  }
  if (err instanceof TmdbError) {
    if (err.status === 404) {
      return c.json({ error: 'Not found' }, 404);
    }
    const status = err.status >= 500 ? 503 : 502;
    return c.json({ error: 'Catalog service unavailable' }, status);
  }
  throw err;
}

catalogRoutes.get('/home', async (c) => {
  try {
    const site = (await getPublishedSiteConfig()) ?? defaultSiteConfig;
    const home = await withTmdbClient((tmdb) =>
      buildCatalogHome(tmdb, site.homepage.blocks, {
        showHero: site.homepage.showHero,
      }),
    );
    return c.json(home);
  } catch (err) {
    return handleCatalogError(c, err);
  }
});

catalogRoutes.get('/search', async (c) => {
  const query = c.req.query('q')?.trim();
  if (!query) {
    return c.json({ error: 'Query parameter "q" is required' }, 400);
  }

  try {
    const data = await withTmdbClient((tmdb) => tmdb.searchMulti(query));
    return c.json(mapSearchResults(data));
  } catch (err) {
    return handleCatalogError(c, err);
  }
});

catalogRoutes.get('/movie/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const data = await withTmdbClient((tmdb) => tmdb.getMovie(id));
    return c.json(mapMovieDetail(data));
  } catch (err) {
    return handleCatalogError(c, err);
  }
});

catalogRoutes.get('/tv/:id/season/:season', async (c) => {
  const id = c.req.param('id');
  const season = c.req.param('season');
  try {
    const data = await withTmdbClient((tmdb) => tmdb.getTvSeason(id, season));
    return c.json(mapSeasonDetail(data));
  } catch (err) {
    return handleCatalogError(c, err);
  }
});

catalogRoutes.get('/tv/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const data = await withTmdbClient((tmdb) => tmdb.getTv(id));
    return c.json(mapTvDetail(data));
  } catch (err) {
    return handleCatalogError(c, err);
  }
});
