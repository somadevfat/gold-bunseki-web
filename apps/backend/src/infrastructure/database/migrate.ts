import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * Runtime migration entry point for production deployments.
 * @responsibility Apply checked-in Drizzle SQL migrations without relying on the drizzle-kit CLI.
 */
const connectionString =
  process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/gold_vola_db';

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

try {
  await migrate(db, { migrationsFolder: './migrations' });
  console.log('[DB Migration] Applied pending migrations.');
} finally {
  await client.end();
}
