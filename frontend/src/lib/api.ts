import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  timeout: 15_000,
})

export interface Quote {
  id: string
  fiatAmount: number
  fiatCurrency: string
  asset: 'XLM' | 'USDC'
  assetAmount: string
  rate: number
  fee: number
  networkFee: string
  expiresAt: string
}

export interface PaymentIntent {
  id: string
  quoteId: string
  destinationAddress: string
  fiatAmount: number
  fiatCurrency: string
  asset: 'XLM' | 'USDC'
  assetAmount: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
  providerReference?: string
  paymentInstructions?: {
    method: string
    details: Record<string, string>
  }
  createdAt: string
  updatedAt: string
}

export interface WalletBalance {
  asset: 'XLM' | 'USDC'
  balance: string
  issuer?: string
}

export interface OnrampConfig {
  supportedCurrencies: string[]
  supportedAssets: string[]
  providers: Array<{ name: string; supportedCurrencies: string[] }>
}

export const onrampApi = {
  getConfig: () => api.get<OnrampConfig>('/api/onramp/config').then((r) => r.data),

  getQuote: (fiatAmount: number, fiatCurrency: string, asset: 'XLM' | 'USDC') =>
    api.post<Quote>('/api/onramp/quote', { fiatAmount, fiatCurrency, asset }).then((r) => r.data),

  createIntent: (quoteId: string, destinationAddress: string, providerName?: string) =>
    api
      .post<PaymentIntent>('/api/onramp/intent', { quoteId, destinationAddress, providerName })
      .then((r) => r.data),

  getIntent: (id: string) =>
    api.get<PaymentIntent>(`/api/onramp/intent/${id}`).then((r) => r.data),

  fulfillIntent: (id: string) =>
    api.post<PaymentIntent>(`/api/onramp/intent/${id}/fulfill`).then((r) => r.data),
}

export const walletApi = {
  getBalances: (address: string) =>
    api.get<WalletBalance[]>(`/api/wallet/${address}/balances`).then((r) => r.data),

  getHistory: (address: string) =>
    api.get<PaymentIntent[]>(`/api/wallet/${address}/history`).then((r) => r.data),
}
