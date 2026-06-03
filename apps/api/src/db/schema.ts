import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { ConnectorConfig } from '@movie-streamer/shared';

export const connectors = pgTable('connectors', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  kind: text('kind').notNull().$type<'demo' | 'manual' | 'http'>(),
  enabled: boolean('enabled').notNull().default(true),
  priority: integer('priority').notNull().default(100),
  config: jsonb('config').notNull().$type<ConnectorConfig>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ConnectorRow = typeof connectors.$inferSelect;
export type NewConnectorRow = typeof connectors.$inferInsert;
