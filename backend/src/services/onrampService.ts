import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { providerRegistry } from '../providers';
import { getRate } from './rateService';
import { sendPayment } from '../stellar';
import {
  ConversionQuote,
  PaymentIntent,
  SupportedAsset,
  SupportedFiat,
} from '../types';

// In-memory quote cache (use Redis in production)
const quoteCache = new Map<string, ConversionQuote>();

export async function createQuote(
  fiatAmount: number,
  fiatCurrency: SupportedFiat,
  asset: SupportedAsset
): Promise<ConversionQuote> {
  const { rate, assetAmount, fee, networkFee } = getRate(fiatAmount, fiatCurrency, asset);
  const quote: ConversionQuote = {
    id: uuidv4(),
    fiatAmount,
    fiatCurrency,
    asset,
    assetAmount,
    rate,
    fee,
    networkFee,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min TTL
  };
  quoteCache.set(quote.id, quote);
  return quote;
}

export function getQuote(quoteId: string): ConversionQuote | undefined {
  const q = quoteCache.get(quoteId);
  if (!q) return undefined;
  if (new Date(q.expiresAt) < new Date()) {
    quoteCache.delete(quoteId);
    return undefined;
  }
  return q;
}

export async function createPaymentIntent(
  quoteId: string,
  destinationAddress: string,
  providerName = 'mock'
): Promise<PaymentIntent> {
  const quote = getQuote(quoteId);
  if (!quote) throw new Error('Quote expired or not found');

  const provider = providerRegistry.get(providerName) ?? providerRegistry.getDefault();
  const intentId = uuidv4();

  const { providerReference, instructions, expiresAt } = await provider.initiatePayment({
    intentId,
    amount: quote.fiatAmount,
    currency: quote.fiatCurrency,
    metadata: { asset: quote.asset, destinationAddress },
  });

  await db.query(
    `INSERT INTO payment_intents
      (id, quote_id, destination_address, fiat_amount, fiat_currency, asset, asset_amount,
       status, provider_name, provider_reference, payment_instructions)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8,$9,$10)`,
    [
      intentId,
      quoteId,
      destinationAddress,
      quote.fiatAmount,
      quote.fiatCurrency,
      quote.asset,
      quote.assetAmount,
      providerName,
      providerReference,
      JSON.stringify(instructions),
    ]
  );

  return {
    id: intentId,
    quoteId,
    destinationAddress,
    fiatAmount: quote.fiatAmount,
    fiatCurrency: quote.fiatCurrency,
    asset: quote.asset,
    assetAmount: quote.assetAmount,
    status: 'pending',
    providerReference,
    paymentInstructions: instructions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getPaymentIntent(intentId: string): Promise<PaymentIntent | null> {
  const { rows } = await db.query(
    `SELECT * FROM payment_intents WHERE id = $1`,
    [intentId]
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id,
    quoteId: r.quote_id,
    destinationAddress: r.destination_address,
    fiatAmount: parseFloat(r.fiat_amount),
    fiatCurrency: r.fiat_currency,
    asset: r.asset,
    assetAmount: r.asset_amount,
    status: r.status,
    providerReference: r.provider_reference,
    paymentInstructions: r.payment_instructions,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/**
 * Called when fiat payment is confirmed — triggers Stellar disbursement.
 * In production, this is triggered by a webhook from the payment provider.
 */
export async function fulfillPaymentIntent(intentId: string): Promise<void> {
  const intent = await getPaymentIntent(intentId);
  if (!intent || intent.status !== 'pending') return;

  const distributionSecret = process.env.DISTRIBUTION_SECRET;
  if (!distributionSecret) {
    // In mock mode, just mark as completed without sending
    await db.query(
      `UPDATE payment_intents SET status='completed', updated_at=NOW() WHERE id=$1`,
      [intentId]
    );
    return;
  }

  await db.query(
    `UPDATE payment_intents SET status='processing', updated_at=NOW() WHERE id=$1`,
    [intentId]
  );

  try {
    const { txHash, ledger } = await sendPayment({
      destinationAddress: intent.destinationAddress,
      asset: intent.asset,
      amount: intent.assetAmount,
      memo: intentId.slice(0, 28),
      distributionSecret,
    });

    const txId = uuidv4();
    await db.query(
      `INSERT INTO stellar_transactions
        (id, payment_intent_id, tx_hash, status, asset, amount, destination_address, memo, ledger, confirmed_at)
       VALUES ($1,$2,$3,'confirmed',$4,$5,$6,$7,$8,NOW())`,
      [txId, intentId, txHash, intent.asset, intent.assetAmount, intent.destinationAddress, intentId.slice(0, 28), ledger]
    );

    await db.query(
      `UPDATE payment_intents SET status='completed', updated_at=NOW() WHERE id=$1`,
      [intentId]
    );
  } catch (err) {
    await db.query(
      `UPDATE payment_intents SET status='failed', updated_at=NOW() WHERE id=$1`,
      [intentId]
    );
    throw err;
  }
}
