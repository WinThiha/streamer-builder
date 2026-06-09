import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { ConnectorConfig, SiteConfig } from '@movie-streamer/shared';

export const connectors = pgTable('connectors', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  kind: text('kind').notNull().$type<'demo' | 'manual' | 'http' | 'embed' | 'manifest'>(),
  enabled: boolean('enabled').notNull().default(true),
  priority: integer('priority').notNull().default(100),
  config: jsonb('config').notNull().$type<ConnectorConfig>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ConnectorRow = typeof connectors.$inferSelect;
export type NewConnectorRow = typeof connectors.$inferInsert;

export const siteConfig = pgTable('site_config', {
  id: text('id').primaryKey(),
  draft: jsonb('draft').notNull().$type<SiteConfig>(),
  published: jsonb('published').notNull().$type<SiteConfig>(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
});

export type SiteConfigRow = typeof siteConfig.$inferSelect;

export const deploymentSettings = pgTable('deployment_settings', {
  id: text('id').primaryKey(),
  adminPasswordHash: text('admin_password_hash'),
  tmdbApiKey: text('tmdb_api_key'),
  setupCompletedAt: timestamp('setup_completed_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type DeploymentSettingsRow = typeof deploymentSettings.$inferSelect;
