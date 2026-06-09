import { Hono } from 'hono';
import { PROTOTYPE_PRESETS, wizardPayloadSchema } from '@movie-streamer/shared';
import { generateDeployPackZip, suggestedPackFilename } from '../pack-generator/generate.js';
import { isPrototypeMode } from '../prototype/mode.js';

export const vendorRoutes = new Hono();

vendorRoutes.use('*', async (c, next) => {
  if (!isPrototypeMode()) {
    return c.json({ error: 'Vendor routes are only available in prototype mode' }, 404);
  }
  await next();
});

vendorRoutes.get('/presets', (c) => {
  return c.json({
    presets: PROTOTYPE_PRESETS.map((p) => ({
      slug: p.slug,
      name: p.name,
      description: p.description,
    })),
  });
});

vendorRoutes.post('/pack', async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = wizardPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: 'Invalid wizard payload', details: parsed.error.flatten() }, 400);
  }

  try {
    const packKind = parsed.data.packKind ?? 'deploy-only';
    const zip = await generateDeployPackZip({
      ...parsed.data,
      packKind,
    });
    const filename = suggestedPackFilename({ ...parsed.data, packKind });
    return new Response(zip, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Pack-Kind': packKind,
        'X-Pack-Bytes': String(zip.byteLength),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Pack generation failed';
    return c.json({ error: message }, 500);
  }
});
