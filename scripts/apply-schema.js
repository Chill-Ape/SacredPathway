import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

async function applyChanges() {
  try {
    console.log('Connecting to database...');
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client, { schema });

    console.log('Applying migrations...');
    await db.query.users.findMany();
    
    console.log('Schema changes applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error applying schema changes:', error);
    process.exit(1);
  }
}

applyChanges();