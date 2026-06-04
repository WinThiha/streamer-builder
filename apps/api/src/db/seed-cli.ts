import { closeDatabase } from '../db.js';
import { runMigrations } from './migrate.js';
import { seedConnectors } from '../connectors/seed.js';
import { seedSiteConfig } from '../site-config/seed.js';

await runMigrations();
await seedSiteConfig();
await seedConnectors();
console.log('Seed complete.');
await closeDatabase();
