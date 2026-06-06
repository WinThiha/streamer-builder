import {
  embedConnectorConfigSchema,
  mediaRefSchema,
} from '@movie-streamer/shared';
import { resolveEmbedConnector } from '../src/resolve/drivers/embed.js';

const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`);
}

const validConfig = {
  kind: 'embed',
  urlTemplate: 'https://embed.example/movie/{id}',
  sourceLabel: 'Smoke Embed',
};
const parsed = embedConnectorConfigSchema.safeParse(validConfig);
record(
  'embed config schema accepts valid template',
  parsed.success,
  parsed.success ? undefined : JSON.stringify(parsed.error.flatten()),
);

const connector = {
  id: 'smoke-embed',
  label: 'Smoke Embed Connector',
  kind: 'embed',
  enabled: true,
  priority: 10,
  config: validConfig,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const movieRef = mediaRefSchema.parse({ provider: 'tmdb', type: 'movie', id: '550' });
const movieSources = resolveEmbedConnector(connector, movieRef);
const movieOk =
  movieSources.length === 1 &&
  movieSources[0].kind === 'embed' &&
  movieSources[0].url === 'https://embed.example/movie/550';
record(
  'embed driver produces embed source for movie mediaRef',
  movieOk,
  movieOk ? movieSources[0].url : JSON.stringify(movieSources),
);

const tvRef = mediaRefSchema.parse({
  provider: 'tmdb',
  type: 'tv',
  id: '1399',
  season: 1,
  episode: 1,
});
const tvTemplateConfig = {
  kind: 'embed',
  urlTemplate: 'https://embed.example/{type}/{id}/s{season}e{episode}',
};
const tvConnector = { ...connector, config: tvTemplateConfig };
const tvSources = resolveEmbedConnector(tvConnector, tvRef);
const tvOk =
  tvSources.length === 1 &&
  tvSources[0].url === 'https://embed.example/tv/1399/s1e1';
record(
  'embed driver produces embed source for TV mediaRef with season/episode',
  tvOk,
  tvOk ? tvSources[0].url : JSON.stringify(tvSources),
);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nInline summary: ${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
