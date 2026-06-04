import {
  HOMEPAGE_CATEGORY_LABELS,
  type HomepageBlock,
  type HomepageCategoryKey,
} from '@movie-streamer/shared';
import type { TmdbClient, TmdbPagedResponse, TmdbMediaItem } from '../tmdb/client.js';
import { mapHomeRowsFromBlocks } from './mappers.js';
import { resolveFeaturedTitle } from './featured.js';
import type { CatalogRow, FeaturedTitle } from './types.js';

async function fetchCategory(
  tmdb: TmdbClient,
  key: HomepageCategoryKey,
): Promise<TmdbPagedResponse<TmdbMediaItem>> {
  switch (key) {
    case 'trending_day':
      return tmdb.getTrendingAll();
    case 'popular_movies':
      return tmdb.getPopularMovies();
    case 'popular_tv':
      return tmdb.getPopularTv();
    case 'top_rated_movies':
      return tmdb.getTopRatedMovies();
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

export async function buildCatalogHome(
  tmdb: TmdbClient,
  blocks: HomepageBlock[],
  options: { showHero: boolean },
): Promise<{ featured: FeaturedTitle | null; rows: CatalogRow[] }> {
  const results = await Promise.all(blocks.map((block) => fetchCategory(tmdb, block.categoryKey)));
  const rows = mapHomeRowsFromBlocks(blocks, results);

  let featured: FeaturedTitle | null = null;
  if (options.showHero && blocks.length > 0) {
    const trending =
      blocks[0]?.categoryKey === 'trending_day'
        ? results[0]
        : await tmdb.getTrendingAll();
    featured = await resolveFeaturedTitle(tmdb, trending);
  }

  return { featured, rows };
}

export function defaultLabelForBlock(block: HomepageBlock): string {
  return block.label ?? HOMEPAGE_CATEGORY_LABELS[block.categoryKey];
}
