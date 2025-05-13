const { migrate } = require('drizzle-orm/postgres-js/migrator');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users, scrolls, userScrolls, oracleMessages, keeperMessages, contactMessages, manaTransactions, manaPackages } = require('../dist/shared/schema');

console.log('Applying schema changes...');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(sql);

async function applyChanges() {
  try {
    // Add manaBalance column to users table
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS mana_balance INTEGER NOT NULL DEFAULT 0`;
    console.log('Added mana_balance column to users table');
    
    // Add stripeCustomerId column to users table
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`;
    console.log('Added stripe_customer_id column to users table');
    
    // Create mana_transactions table
    await sql`
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
    `;
    console.log('Created mana_transactions table');
    
    // Create mana_packages table
    await sql`
      CREATE TABLE IF NOT EXISTS mana_packages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        amount INTEGER NOT NULL,
        price INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('Created mana_packages table');
    
    console.log('Schema changes applied successfully');
  } catch (error) {
    console.error('Error applying schema changes:', error);
  } finally {
    await sql.end();
  }
}

applyChanges();