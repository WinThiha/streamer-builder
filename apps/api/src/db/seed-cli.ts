import { closeDatabase } from '../db.js';
import { runMigrations } from './migrate.js';
import { seedConnectors } from '../connectors/seed.js';

await runMigrations();
await seedConnectors();
console.log('Seed complete.');
await closeDatabase();
