import { Router, Request, Response } from 'express';
import { getBalances, getAccountTransactions } from '../stellar';
import { db } from '../db';

const router = Router();

// GET /api/wallet/:address/balances
router.get('/:address/balances', async (req: Request, res: Response) => {
  try {
    const balances = await getBalances(req.params.address);
    res.json(balances);
  } catch (err: unknown) {
    const msg = (err as Error).message;
    if (msg.includes('Not Found')) {
      return res.status(404).json({ error: 'Account not found on Stellar network' });
    }
    res.status(500).json({ error: msg });
  }
});

// GET /api/wallet/:address/transactions
router.get('/:address/transactions', async (req: Request, res: Response) => {
  try {
    const txs = await getAccountTransactions(req.params.address, 20);
    res.json(txs);
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/wallet/:address/history — onramp history from our DB
router.get('/:address/history', async (req: Request, res: Response) => {
  const { rows } = await db.query(
    `SELECT pi.*, st.tx_hash, st.ledger, st.confirmed_at
     FROM payment_intents pi
     LEFT JOIN stellar_transactions st ON st.payment_intent_id = pi.id
     WHERE pi.destination_address = $1
     ORDER BY pi.created_at DESC
     LIMIT 50`,
    [req.params.address]
  );
  res.json(rows);
});

export default router;
