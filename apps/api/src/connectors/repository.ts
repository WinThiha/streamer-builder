import { asc, eq } from 'drizzle-orm';
import { connectorConfigSchema, type ConnectorConfig, type ConnectorKind } from '@movie-streamer/shared';
import { db } from '../db.js';
import { connectors, type ConnectorRow, type NewConnectorRow } from '../db/schema.js';

export type ConnectorRecord = ConnectorRow;

function parseConfig(kind: ConnectorKind, config: unknown): ConnectorConfig {
  const withKind = { ...(config as object), kind };
  return connectorConfigSchema.parse(withKind);
}

export function toConnectorRecord(row: ConnectorRow): ConnectorRecord {
  return {
    ...row,
    config: parseConfig(row.kind, row.config),
  };
}

export async function listConnectors(): Promise<ConnectorRecord[]> {
  const rows = await db.select().from(connectors).orderBy(asc(connectors.priority), asc(connectors.label));
  return rows.map(toConnectorRecord);
}

export async function listEnabledConnectors(): Promise<ConnectorRecord[]> {
  const rows = await db
    .select()
    .from(connectors)
    .where(eq(connectors.enabled, true))
    .orderBy(asc(connectors.priority), asc(connectors.label));
  return rows.map(toConnectorRecord);
}

export async function getConnectorById(id: string): Promise<ConnectorRecord | null> {
  const rows = await db.select().from(connectors).where(eq(connectors.id, id)).limit(1);
  const row = rows[0];
  return row ? toConnectorRecord(row) : null;
}

export async function createConnector(input: NewConnectorRow): Promise<ConnectorRecord> {
  const now = new Date();
  const rows = await db
    .insert(connectors)
    .values({
      ...input,
      config: connectorConfigSchema.parse(input.config),
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return toConnectorRecord(rows[0]!);
}

export async function updateConnector(
  id: string,
  patch: Partial<Pick<NewConnectorRow, 'label' | 'enabled' | 'priority' | 'config'>>,
): Promise<ConnectorRecord | null> {
  const existing = await getConnectorById(id);
  if (!existing) return null;

  const config =
    patch.config !== undefined
      ? connectorConfigSchema.parse(patch.config)
      : existing.config;

  const rows = await db
    .update(connectors)
    .set({
      ...patch,
      config,
      updatedAt: new Date(),
    })
    .where(eq(connectors.id, id))
    .returning();
  return rows[0] ? toConnectorRecord(rows[0]) : null;
}

export async function deleteConnector(id: string): Promise<boolean> {
  const result = await db.delete(connectors).where(eq(connectors.id, id)).returning({ id: connectors.id });
  return result.length > 0;
}

export async function getConnectorsCacheFingerprint(): Promise<string> {
  const rows = await db
    .select({
      id: connectors.id,
      updatedAt: connectors.updatedAt,
      enabled: connectors.enabled,
    })
    .from(connectors)
    .orderBy(asc(connectors.id));
  return rows.map((r) => `${r.id}:${r.enabled}:${r.updatedAt.toISOString()}`).join('|');
}
