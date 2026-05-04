import { PaymentProvider } from './PaymentProvider';
import {
  InitiatePaymentParams,
  InitiatePaymentResult,
  PaymentProviderConfig,
  VerifyPaymentResult,
} from '../types';

/**
 * Mock provider for development and testing.
 * Simulates a bank transfer flow. Replace with real provider in production.
 */
export class MockProvider extends PaymentProvider {
  readonly config: PaymentProviderConfig = {
    name: 'mock',
    supportedCurrencies: ['NGN', 'KES', 'GHS', 'ZAR', 'BRL', 'PHP', 'USD'],
    supportedMethods: ['bank_transfer', 'mobile_money'],
  };

  // In-memory store for demo purposes
  private payments = new Map<string, { status: 'pending' | 'completed'; paidAt?: string }>();

  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const ref = `MOCK-${params.intentId.slice(0, 8).toUpperCase()}`;
    this.payments.set(ref, { status: 'pending' });

    // Auto-complete after 5 seconds in dev mode
    setTimeout(() => {
      this.payments.set(ref, { status: 'completed', paidAt: new Date().toISOString() });
    }, 5000);

    return {
      providerReference: ref,
      instructions: {
        method: 'bank_transfer',
        details: {
          bankName: 'Demo Bank',
          accountNumber: '0123456789',
          accountName: 'StellarOnRamp Escrow',
          reference: ref,
          amount: `${params.amount} ${params.currency}`,
          note: 'Use the reference code as payment narration',
        },
      },
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  async verifyPayment(providerReference: string): Promise<VerifyPaymentResult> {
    const payment = this.payments.get(providerReference);
    if (!payment) return { status: 'failed' };
    return {
      status: payment.status === 'completed' ? 'completed' : 'pending',
      paidAt: payment.paidAt,
    };
  }

  async handleWebhook(
    payload: unknown,
    _signature: string
  ): Promise<{ intentId: string; status: VerifyPaymentResult }> {
    const p = payload as { reference: string; intentId: string };
    const payment = this.payments.get(p.reference);
    return {
      intentId: p.intentId,
      status: { status: payment?.status === 'completed' ? 'completed' : 'pending' },
    };
  }
}
