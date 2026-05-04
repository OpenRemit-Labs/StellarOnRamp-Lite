import { Router, Request, Response } from 'express';
import { providerRegistry } from '../providers';
import { fulfillPaymentIntent } from '../services/onrampService';

const router = Router();

// POST /api/webhooks/:provider
router.post('/:provider', async (req: Request, res: Response) => {
  const provider = providerRegistry.get(req.params.provider);
  if (!provider) return res.status(404).json({ error: 'Unknown provider' });

  const signature = (req.headers['x-signature'] as string) ?? '';

  try {
    const { intentId, status } = await provider.handleWebhook(req.body, signature);
    if (status.status === 'completed') {
      await fulfillPaymentIntent(intentId);
    }
    res.json({ received: true });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
