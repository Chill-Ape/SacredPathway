import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if we have a database URL
export const isDatabaseAvailable = !!process.env.DATABASE_URL;

// Only create the database client if we have a connection string
export let pool: Pool | null = null;
export let db: any = null;

if (isDatabaseAvailable) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL as string });
    db = drizzle({ client: pool, schema });
    console.log('Database connection established');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}