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
import { validateHttpConnectorUrl } from '../../resolve/drivers/http.js';
import { requireAdminAuth } from '../../auth/middleware.js';
import {
  isConnectorKindAllowedInPrototype,
  prototypeConnectorForbiddenMessage,
} from '../../prototype/connector-policy.js';
import { isPrototypeMode } from '../../prototype/mode.js';

export const adminConnectorRoutes = new Hono();

adminConnectorRoutes.use('*', requireAdminAuth);

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
  const parsed = connectorConfigSchema.parse({ ...(config as object), kind });
  if (parsed.kind === 'http') {
    validateHttpConnectorUrl(parsed.resolveUrl);
  }
  if (parsed.kind === 'manifest') {
    validateHttpConnectorUrl(parsed.manifestUrl);
  }
  return parsed;
}

function isPrototypeConnectorForbidden(kind: z.infer<typeof connectorKindSchema>): boolean {
  return isPrototypeMode() && !isConnectorKindAllowedInPrototype(kind);
}

function validationErrorResponse(err: z.ZodError) {
  const message = err.errors.map((issue) => issue.message).join('; ') || 'Invalid connector config';
  return { error: message, details: err.flatten() };
}

adminConnectorRoutes.get('/', async (c) => {
  const connectors = await listConnectors();
  return c.json({ connectors });
});

adminConnectorRoutes.post('/', async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  try {
    const body = createBodySchema.parse(raw);
    if (isPrototypeConnectorForbidden(body.kind)) {
      return c.json({ error: prototypeConnectorForbiddenMessage() }, 403);
    }
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
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json(validationErrorResponse(err), 400);
    }
    throw err;
  }
});

adminConnectorRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  try {
    const body = updateBodySchema.parse(raw);
    const existing = await getConnectorById(id);
    if (!existing) {
      return c.json({ error: 'Not found' }, 404);
    }

    if (body.enabled === true && isPrototypeMode() && !isConnectorKindAllowedInPrototype(existing.kind)) {
      return c.json({ error: prototypeConnectorForbiddenMessage() }, 403);
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
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json(validationErrorResponse(err), 400);
    }
    throw err;
  }
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
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  try {
    const body = z.object({ mediaRef: mediaRefSchema }).parse(raw);
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
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json(validationErrorResponse(err), 400);
    }
    throw err;
  }
});
