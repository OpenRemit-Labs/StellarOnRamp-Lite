import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

export async function initDb() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS payment_intents (
      id UUID PRIMARY KEY,
      quote_id TEXT NOT NULL,
      destination_address TEXT NOT NULL,
      fiat_amount NUMERIC NOT NULL,
      fiat_currency TEXT NOT NULL,
      asset TEXT NOT NULL,
      asset_amount TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      provider_name TEXT,
      provider_reference TEXT,
      payment_instructions JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS stellar_transactions (
      id UUID PRIMARY KEY,
      payment_intent_id UUID REFERENCES payment_intents(id),
      tx_hash TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      asset TEXT NOT NULL,
      amount TEXT NOT NULL,
      destination_address TEXT NOT NULL,
      memo TEXT,
      ledger INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      confirmed_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
    CREATE INDEX IF NOT EXISTS idx_stellar_tx_intent ON stellar_transactions(payment_intent_id);
    CREATE INDEX IF NOT EXISTS idx_stellar_tx_hash ON stellar_transactions(tx_hash);
  `);
}
