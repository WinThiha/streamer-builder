import { Hono } from 'hono';
import { z } from 'zod';
import {
  connectorConfigSchema,
  connectorKindSchema,
  mediaRefSchema,
  type ConnectorConfig,
} from '@movie-streamer/shared';
import {
  createConnector,
  deleteConnector,
  getConnectorById,
  listConnectors,
  updateConnector,
} from '../../connectors/repository.js';
import { bumpResolveCacheGeneration, testConnector } from '../../resolve/orchestrator.js';

export const adminConnectorRoutes = new Hono();

const createBodySchema = z.object({
  id: z.string().min(1).optional(),
  label: z.string().min(1),
  kind: connectorKindSchema,
  enabled: z.boolean().default(true),
  priority: z.number().int().default(100),
  config: z.unknown(),
});

const updateBodySchema = z.object({
  label: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
  priority: z.number().int().optional(),
  config: z.unknown().optional(),
});

function validateConfig(kind: z.infer<typeof connectorKindSchema>, config: unknown): ConnectorConfig {
  return connectorConfigSchema.parse({ ...(config as object), kind });
}

adminConnectorRoutes.get('/', async (c) => {
  const connectors = await listConnectors();
  return c.json({ connectors });
});

adminConnectorRoutes.post('/', async (c) => {
  const body = createBodySchema.parse(await c.req.json());
  const config = validateConfig(body.kind, body.config);
  const id = body.id ?? crypto.randomUUID();

  const existing = await getConnectorById(id);
  if (existing) {
    return c.json({ error: 'Connector id already exists' }, 409);
  }

  const connector = await createConnector({
    id,
    label: body.label,
    kind: body.kind,
    enabled: body.enabled,
    priority: body.priority,
    config,
  });
  bumpResolveCacheGeneration();
  return c.json({ connector }, 201);
});

adminConnectorRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = updateBodySchema.parse(await c.req.json());
  const existing = await getConnectorById(id);
  if (!existing) {
    return c.json({ error: 'Not found' }, 404);
  }

  const config =
    body.config !== undefined ? validateConfig(existing.kind, body.config) : undefined;

  const connector = await updateConnector(id, {
    label: body.label,
    enabled: body.enabled,
    priority: body.priority,
    config,
  });
  bumpResolveCacheGeneration();
  return c.json({ connector });
});

adminConnectorRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const deleted = await deleteConnector(id);
  if (!deleted) {
    return c.json({ error: 'Not found' }, 404);
  }
  bumpResolveCacheGeneration();
  return c.json({ ok: true });
});

adminConnectorRoutes.post('/:id/test', async (c) => {
  const id = c.req.param('id');
  const body = z.object({ mediaRef: mediaRefSchema }).parse(await c.req.json());
  const connector = await getConnectorById(id);
  if (!connector) {
    return c.json({ error: 'Not found' }, 404);
  }

  const result = await testConnector(connector, body.mediaRef);
  return c.json({
    connectorId: id,
    ok: result.ok,
    sources: result.sources,
    error: result.error,
  });
});
