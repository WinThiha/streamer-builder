import { Hono } from 'hono';
import {
  mapHomeRows,
  mapMovieDetail,
  mapSearchResults,
  mapSeasonDetail,
  mapTvDetail,
} from '../catalog/mappers.js';
import { resolveFeaturedTitle } from '../catalog/featured.js';
import { TmdbClient, TmdbError } from '../tmdb/client.js';
import { env } from '../env.js';

const tmdb = new TmdbClient(env.TMDB_API_KEY);

export const catalogRoutes = new Hono();

catalogRoutes.get('/home', async (c) => {
  try {
    const [trending, popularMovies, popularTv] = await Promise.all([
      tmdb.getTrendingAll(),
      tmdb.getPopularMovies(),
      tmdb.getPopularTv(),
    ]);
    const featured = await resolveFeaturedTitle(tmdb, trending);
    const { rows } = mapHomeRows(trending, popularMovies, popularTv);
    return c.json({ featured, rows });
  } catch (err) {
    return handleTmdbError(c, err);
  }
});

catalogRoutes.get('/search', async (c) => {
  const query = c.req.query('q')?.trim();
  if (!query) {
    return c.json({ error: 'Query parameter "q" is required' }, 400);
  }

  try {
    const data = await tmdb.searchMulti(query);
    return c.json(mapSearchResults(data));
  } catch (err) {
    return handleTmdbError(c, err);
  }
});

catalogRoutes.get('/movie/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const data = await tmdb.getMovie(id);
    return c.json(mapMovieDetail(data));
  } catch (err) {
    return handleTmdbError(c, err);
  }
});

catalogRoutes.get('/tv/:id/season/:season', async (c) => {
  const id = c.req.param('id');
  const season = c.req.param('season');
  try {
    const data = await tmdb.getTvSeason(id, season);
    return c.json(mapSeasonDetail(data));
  } catch (err) {
    return handleTmdbError(c, err);
  }
});

catalogRoutes.get('/tv/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const data = await tmdb.getTv(id);
    return c.json(mapTvDetail(data));
  } catch (err) {
    return handleTmdbError(c, err);
  }
});

function handleTmdbError(c: { json: (body: unknown, status?: number) => Response }, err: unknown) {
  if (err instanceof TmdbError) {
    if (err.status === 404) {
      return c.json({ error: 'Not found' }, 404);
    }
    const status = err.status >= 500 ? 503 : 502;
    return c.json({ error: 'Catalog service unavailable' }, status);
  }
  throw err;
}
