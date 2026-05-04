import { PaymentProvider } from './PaymentProvider';
import { MockProvider } from './MockProvider';

/**
 * Payment provider registry.
 * Add real providers here (Flutterwave, Paystack, etc.)
 */
export class ProviderRegistry {
  private providers = new Map<string, PaymentProvider>();

  constructor() {
    this.register(new MockProvider());
  }

  register(provider: PaymentProvider) {
    this.providers.set(provider.config.name, provider);
  }

  get(name: string): PaymentProvider | undefined {
    return this.providers.get(name);
  }

  getDefault(): PaymentProvider {
    return this.providers.get('mock')!;
  }

  list() {
    return Array.from(this.providers.values()).map((p) => p.config);
  }
}

export const providerRegistry = new ProviderRegistry();
