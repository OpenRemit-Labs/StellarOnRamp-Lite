// Core domain types for StellarOnRamp Lite

export type SupportedFiat = 'NGN' | 'KES' | 'GHS' | 'ZAR' | 'BRL' | 'PHP' | 'USD';
export type SupportedAsset = 'XLM' | 'USDC';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
export type TxStatus = 'pending' | 'confirmed' | 'failed';

export interface ConversionQuote {
  id: string;
  fiatAmount: number;
  fiatCurrency: SupportedFiat;
  asset: SupportedAsset;
  assetAmount: string;       // string to preserve precision
  rate: number;              // fiat per 1 asset unit
  fee: number;               // fiat fee
  networkFee: string;        // XLM network fee
  expiresAt: string;         // ISO timestamp
}

export interface PaymentIntent {
  id: string;
  quoteId: string;
  destinationAddress: string;
  fiatAmount: number;
  fiatCurrency: SupportedFiat;
  asset: SupportedAsset;
  assetAmount: string;
  status: PaymentStatus;
  providerReference?: string;
  paymentInstructions?: PaymentInstructions;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInstructions {
  method: 'bank_transfer' | 'mobile_money' | 'card';
  details: Record<string, string>;
}

export interface StellarTransaction {
  id: string;
  paymentIntentId: string;
  txHash?: string;
  status: TxStatus;
  asset: SupportedAsset;
  amount: string;
  destinationAddress: string;
  memo?: string;
  ledger?: number;
  createdAt: string;
  confirmedAt?: string;
}

export interface WalletBalance {
  asset: SupportedAsset;
  balance: string;
  issuer?: string;
}

// Payment provider abstraction
export interface PaymentProviderConfig {
  name: string;
  supportedCurrencies: SupportedFiat[];
  supportedMethods: PaymentInstructions['method'][];
}

export interface InitiatePaymentParams {
  intentId: string;
  amount: number;
  currency: SupportedFiat;
  metadata?: Record<string, string>;
}

export interface InitiatePaymentResult {
  providerReference: string;
  instructions: PaymentInstructions;
  expiresAt: string;
}

export interface VerifyPaymentResult {
  status: PaymentStatus;
  paidAmount?: number;
  paidAt?: string;
}
