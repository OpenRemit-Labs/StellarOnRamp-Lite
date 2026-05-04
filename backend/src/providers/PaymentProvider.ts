import {
  InitiatePaymentParams,
  InitiatePaymentResult,
  PaymentProviderConfig,
  VerifyPaymentResult,
} from '../types';

/**
 * Abstract base class for payment providers.
 * Implement this to add Flutterwave, Paystack, M-Pesa, etc.
 */
export abstract class PaymentProvider {
  abstract readonly config: PaymentProviderConfig;

  /** Initiate a fiat payment and return provider reference + instructions */
  abstract initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult>;

  /** Check payment status with the provider */
  abstract verifyPayment(providerReference: string): Promise<VerifyPaymentResult>;

  /** Handle incoming webhook from provider */
  abstract handleWebhook(payload: unknown, signature: string): Promise<{ intentId: string; status: VerifyPaymentResult }>;
}
