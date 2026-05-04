# StellarOnRamp Lite

> Open-source fiat-to-Stellar onboarding layer for emerging markets.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar-black?logo=stellar)](https://stellar.org)
[![Network: Testnet](https://img.shields.io/badge/Network-Testnet-yellow)](https://horizon-testnet.stellar.org)

---

## The Problem

Over 1.4 billion people remain unbanked. Millions more are underbanked — they have phones, but no reliable way to access global financial infrastructure. Sending money across borders costs 6–10% in fees and takes days.

Stellar was built to fix this. But the last mile — getting local currency *into* the Stellar ecosystem — is still hard.

**StellarOnRamp Lite** is the missing piece: a modular, open-source fiat-to-Stellar onboarding layer that any developer can deploy, extend, and integrate with local payment providers.

---

## Why Stellar?

| Feature | Stellar |
|---|---|
| Settlement time | ~5 seconds |
| Transaction fee | < $0.00001 |
| Native stablecoin | USDC (Circle) |
| Cross-border | Built-in path payments |
| Compliance | SEP-6, SEP-24, SEP-31 |

Stellar's architecture is purpose-built for financial inclusion. StellarOnRamp Lite makes that accessible to end users in Nigeria, Kenya, Ghana, Brazil, the Philippines, and beyond.

---

## How It Works

```
User enters amount (e.g., ₦50,000 NGN)
        ↓
System fetches live quote (rate + fee breakdown)
        ↓
User confirms → Payment intent created
        ↓
User pays via bank transfer / mobile money
        ↓
Backend verifies payment (webhook or polling)
        ↓
Stellar SDK sends XLM or USDC to user's wallet
        ↓
User sees confirmed transaction on dashboard
```

---

## Features

- **Wallet connection** — Freighter browser extension or manual address entry
- **Multi-currency fiat** — NGN, KES, GHS, ZAR, BRL, PHP, USD
- **Asset choice** — XLM or USDC on Stellar
- **Live quotes** — Rate + fee breakdown before committing
- **Modular payment providers** — Plug in Flutterwave, Paystack, M-Pesa, etc.
- **Stellar SDK integration** — Real transactions, memos, path payments
- **Transaction tracking** — Hash, ledger, status polling
- **Dashboard** — Balances + full onramp history
- **Non-custodial** — Private keys never leave the user's wallet

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ConnectPage → OnrampPage (4-step) → DashboardPage  │
│  Freighter integration · Zustand state · TanStack Q │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│                  Backend (Express)                   │
│                                                      │
│  /api/onramp  ──→  onrampService                    │
│  /api/wallet  ──→  Stellar Horizon                  │
│  /api/webhooks ──→ PaymentProvider.handleWebhook    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │         Payment Provider Interface          │    │
│  │  MockProvider | Flutterwave | Paystack | …  │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌──────────────┐   ┌──────────────────────────┐   │
│  │  PostgreSQL  │   │     Stellar SDK           │   │
│  │  (intents,   │   │  Horizon · Payments ·     │   │
│  │   tx records)│   │  Path Payments · Memos    │   │
│  └──────────────┘   └──────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Quick Start (< 5 minutes)

### Prerequisites

- Node.js 18+
- PostgreSQL (or skip DB — runs in mock mode without it)
- [Freighter wallet](https://freighter.app) (optional for testing)

### 1. Clone

```bash
git clone https://github.com/your-org/stellar-onramp-lite.git
cd stellar-onramp-lite
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Configure backend

```bash
cd backend
cp .env.example .env
# Edit .env — minimum required: DATABASE_URL (or leave blank for mock mode)
```

### 4. Start backend

```bash
npm run dev:backend
# ✓ StellarOnRamp API running on port 3001
```

### 5. Start frontend

```bash
# In a new terminal
npm run dev:frontend
# ✓ http://localhost:5173
```

### 6. Try it

1. Open http://localhost:5173
2. Click **Enter address manually** and paste any Stellar testnet address
3. Enter an amount (e.g., 50000 NGN)
4. Select XLM or USDC
5. Get a quote → Confirm → Click **🧪 Simulate Payment (Dev)**
6. Watch the transaction complete in ~5 seconds

---

## Adding a Real Payment Provider

Implement the `PaymentProvider` abstract class:

```typescript
// backend/src/providers/FlutterwaveProvider.ts
import { PaymentProvider } from './PaymentProvider'

export class FlutterwaveProvider extends PaymentProvider {
  readonly config = {
    name: 'flutterwave',
    supportedCurrencies: ['NGN', 'KES', 'GHS'],
    supportedMethods: ['bank_transfer', 'mobile_money', 'card'],
  }

  async initiatePayment(params) {
    // Call Flutterwave API
  }

  async verifyPayment(reference) {
    // Verify with Flutterwave
  }

  async handleWebhook(payload, signature) {
    // Validate signature + parse event
  }
}
```

Then register it:

```typescript
// backend/src/providers/index.ts
providerRegistry.register(new FlutterwaveProvider())
```

---

## API Reference

### `GET /api/onramp/config`
Returns supported currencies, assets, and providers.

### `POST /api/onramp/quote`
```json
{ "fiatAmount": 50000, "fiatCurrency": "NGN", "asset": "XLM" }
```

### `POST /api/onramp/intent`
```json
{ "quoteId": "uuid", "destinationAddress": "G...", "providerName": "mock" }
```

### `GET /api/onramp/intent/:id`
Poll payment + Stellar transaction status.

### `GET /api/wallet/:address/balances`
Returns XLM and USDC balances from Stellar Horizon.

### `GET /api/wallet/:address/history`
Returns onramp transaction history from the database.

### `POST /api/webhooks/:provider`
Webhook endpoint for payment provider callbacks.

---

## Deployment

### Backend (Railway / Render / Fly.io)

```bash
cd backend
npm run build
# Set environment variables from .env.example
# Start: node dist/index.js
```

### Frontend (Vercel / Netlify)

```bash
cd frontend
npm run build
# Deploy dist/ folder
# Set VITE_API_URL to your backend URL
```

### Docker (coming soon)

See [ROADMAP.md](ROADMAP.md).

---

## Stellar Whitepaper Alignment

This project directly demonstrates Stellar's core thesis:

| Principle | Implementation |
|---|---|
| Low-cost transactions | < $0.00001 per Stellar tx |
| Fast settlement | ~5 second finality |
| Cross-border usability | Multi-currency fiat input, global Stellar output |
| Financial inclusion | Targets NGN, KES, GHS — unbanked/underbanked markets |
| Real-world payment use | Modular provider system for local payment rails |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Good first issues in [GOOD_FIRST_ISSUES.md](GOOD_FIRST_ISSUES.md).

---

## License

MIT — see [LICENSE](LICENSE).

---

## Acknowledgements

Built with [Stellar SDK](https://github.com/stellar/js-stellar-sdk), [Freighter](https://freighter.app), and ❤️ for financial inclusion.
