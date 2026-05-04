import { SupportedAsset, SupportedFiat } from '../types';

/**
 * Exchange rate service.
 * In production, replace with CoinGecko, Stellar DEX path-finding, or a real FX feed.
 */

// Mock rates: how many fiat units per 1 asset unit
const MOCK_RATES: Record<SupportedFiat, Record<SupportedAsset, number>> = {
  NGN: { XLM: 1850, USDC: 1580 },
  KES: { XLM: 18.5, USDC: 130 },
  GHS: { XLM: 1.85, USDC: 15.8 },
  ZAR: { XLM: 3.2, USDC: 18.5 },
  BRL: { XLM: 0.85, USDC: 5.1 },
  PHP: { XLM: 8.5, USDC: 57 },
  USD: { XLM: 0.115, USDC: 1.0 },
};

const PLATFORM_FEE_PERCENT = 0.015; // 1.5%
const NETWORK_FEE_XLM = '0.00001';  // Stellar base fee

export interface RateResult {
  rate: number;
  fiatAmount: number;
  assetAmount: string;
  fee: number;
  networkFee: string;
}

export function getRate(
  fiatAmount: number,
  fiatCurrency: SupportedFiat,
  asset: SupportedAsset
): RateResult {
  const rate = MOCK_RATES[fiatCurrency]?.[asset];
  if (!rate) throw new Error(`Unsupported pair: ${fiatCurrency}/${asset}`);

  const fee = parseFloat((fiatAmount * PLATFORM_FEE_PERCENT).toFixed(2));
  const netFiat = fiatAmount - fee;
  const assetAmount = (netFiat / rate).toFixed(7);

  return { rate, fiatAmount, assetAmount, fee, networkFee: NETWORK_FEE_XLM };
}

export function getSupportedCurrencies(): SupportedFiat[] {
  return Object.keys(MOCK_RATES) as SupportedFiat[];
}
