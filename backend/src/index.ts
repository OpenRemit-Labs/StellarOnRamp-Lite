import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initDb } from './db';
import onrampRoutes from './routes/onramp';
import walletRoutes from './routes/wallet';
import webhookRoutes from './routes/webhooks';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000),
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Raw body for webhook signature verification
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());

// Routes
app.use('/api/onramp', onrampRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', network: process.env.STELLAR_NETWORK }));

// Start
async function start() {
  try {
    await initDb();
    console.log('✓ Database initialized');
  } catch (err) {
    console.warn('⚠ Database unavailable, running without persistence:', (err as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`✓ StellarOnRamp API running on port ${PORT}`);
    console.log(`  Network: ${process.env.STELLAR_NETWORK ?? 'testnet'}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;
