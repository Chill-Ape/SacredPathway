import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

console.log('Applying schema changes...');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function applyChanges() {
  try {
    // Add manaBalance column to users table
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS mana_balance INTEGER NOT NULL DEFAULT 0');
    console.log('Added mana_balance column to users table');
    
    // Add stripeCustomerId column to users table
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT');
    console.log('Added stripe_customer_id column to users table');
    
    // Create mana_transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mana_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        description TEXT NOT NULL,
        transaction_type TEXT NOT NULL,
        reference_id TEXT,
        stripe_payment_intent_id TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('Created mana_transactions table');
    
    // Create mana_packages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mana_packages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        amount INTEGER NOT NULL,
        price INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('Created mana_packages table');
    
    console.log('Schema changes applied successfully');
  } catch (error) {
    console.error('Error applying schema changes:', error);
  } finally {
    await pool.end();
  }
}

applyChanges();