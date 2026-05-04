import * as StellarSdk from '@stellar/stellar-sdk';
import { SupportedAsset, WalletBalance } from '../types';

const NETWORK = process.env.STELLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
const HORIZON_URL =
  process.env.STELLAR_HORIZON_URL ||
  (NETWORK === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org');

// USDC asset definition
const USDC_ISSUER =
  process.env.USDC_ISSUER || 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const USDC = new StellarSdk.Asset('USDC', USDC_ISSUER);

export const server = new StellarSdk.Horizon.Server(HORIZON_URL);
export const networkPassphrase =
  NETWORK === 'mainnet'
    ? StellarSdk.Networks.PUBLIC
    : StellarSdk.Networks.TESTNET;

export function getAsset(asset: SupportedAsset): StellarSdk.Asset {
  return asset === 'XLM' ? StellarSdk.Asset.native() : USDC;
}

/**
 * Fetch account balances for XLM and USDC.
 */
export async function getBalances(address: string): Promise<WalletBalance[]> {
  const account = await server.loadAccount(address);
  const balances: WalletBalance[] = [];

  for (const b of account.balances) {
    if (b.asset_type === 'native') {
      balances.push({ asset: 'XLM', balance: b.balance });
    } else if (
      b.asset_type === 'credit_alphanum4' &&
      b.asset_code === 'USDC' &&
      b.asset_issuer === USDC_ISSUER
    ) {
      balances.push({ asset: 'USDC', balance: b.balance, issuer: b.asset_issuer });
    }
  }

  return balances;
}

/**
 * Check if an account has a USDC trustline.
 */
export async function hasTrustline(address: string): Promise<boolean> {
  try {
    const account = await server.loadAccount(address);
    return account.balances.some(
      (b) =>
        b.asset_type === 'credit_alphanum4' &&
        b.asset_code === 'USDC' &&
        b.asset_issuer === USDC_ISSUER
    );
  } catch {
    return false;
  }
}

/**
 * Build and submit a payment transaction from the distribution account.
 * In production, the distribution account keypair is loaded from a secure vault.
 */
export async function sendPayment(params: {
  destinationAddress: string;
  asset: SupportedAsset;
  amount: string;
  memo?: string;
  distributionSecret: string;
}): Promise<{ txHash: string; ledger: number }> {
  const { destinationAddress, asset, amount, memo, distributionSecret } = params;

  const keypair = StellarSdk.Keypair.fromSecret(distributionSecret);
  const account = await server.loadAccount(keypair.publicKey());

  const txBuilder = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: destinationAddress,
        asset: getAsset(asset),
        amount,
      })
    )
    .setTimeout(30);

  if (memo) {
    txBuilder.addMemo(StellarSdk.Memo.text(memo.slice(0, 28)));
  }

  const tx = txBuilder.build();
  tx.sign(keypair);

  const result = await server.submitTransaction(tx);
  return {
    txHash: result.hash,
    ledger: (result as unknown as { ledger: number }).ledger,
  };
}

/**
 * Get transaction details from Horizon.
 */
export async function getTransaction(txHash: string) {
  return server.transactions().transaction(txHash).call();
}

/**
 * Fetch recent transactions for an account.
 */
export async function getAccountTransactions(address: string, limit = 20) {
  const result = await server
    .transactions()
    .forAccount(address)
    .limit(limit)
    .order('desc')
    .call();
  return result.records;
}
