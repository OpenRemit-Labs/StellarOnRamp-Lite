import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createQuote, createPaymentIntent, getPaymentIntent, fulfillPaymentIntent } from '../services/onrampService';
import { getSupportedCurrencies } from '../services/rateService';
import { providerRegistry } from '../providers';

const router = Router();

const QuoteSchema = z.object({
  fiatAmount: z.number().positive(),
  fiatCurrency: z.string().min(3).max(3),
  asset: z.enum(['XLM', 'USDC']),
});

const IntentSchema = z.object({
  quoteId: z.string().uuid(),
  destinationAddress: z.string().min(56).max(56),
  providerName: z.string().optional(),
});

// GET /api/onramp/config
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    supportedCurrencies: getSupportedCurrencies(),
    supportedAssets: ['XLM', 'USDC'],
    providers: providerRegistry.list(),
  });
});

// POST /api/onramp/quote
router.post('/quote', async (req: Request, res: Response) => {
  const parsed = QuoteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const quote = await createQuote(
      parsed.data.fiatAmount,
      parsed.data.fiatCurrency as never,
      parsed.data.asset
    );
    res.json(quote);
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// POST /api/onramp/intent
router.post('/intent', async (req: Request, res: Response) => {
  const parsed = IntentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const intent = await createPaymentIntent(
      parsed.data.quoteId,
      parsed.data.destinationAddress,
      parsed.data.providerName
    );
    res.status(201).json(intent);
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// GET /api/onramp/intent/:id
router.get('/intent/:id', async (req: Request, res: Response) => {
  const intent = await getPaymentIntent(req.params.id);
  if (!intent) return res.status(404).json({ error: 'Not found' });
  res.json(intent);
});

// POST /api/onramp/intent/:id/fulfill (dev/testing endpoint)
router.post('/intent/:id/fulfill', async (req: Request, res: Response) => {
  try {
    await fulfillPaymentIntent(req.params.id);
    const intent = await getPaymentIntent(req.params.id);
    res.json(intent);
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
