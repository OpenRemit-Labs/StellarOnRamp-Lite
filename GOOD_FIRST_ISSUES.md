# Good First Issues

New to the project? These are well-scoped, self-contained tasks that don't require deep knowledge of the codebase.

---

## 🟢 Beginner

### GFI-001: Add INR (Indian Rupee) support
**File:** `backend/src/services/rateService.ts`  
Add `INR` to `MOCK_RATES` with approximate rates for XLM and USDC.  
Also add `INR` to `SupportedFiat` in `backend/src/types/index.ts`.  
**Skills:** TypeScript basics

---

### GFI-002: Add currency flag emojis to the frontend
**File:** `frontend/src/pages/OnrampPage.tsx`  
Add a `FIAT_FLAGS` map (e.g., `{ NGN: '🇳🇬', KES: '🇰🇪' }`) and display flags next to currency names in the selector.  
**Skills:** React, TypeScript

---

### GFI-003: Show quote expiry countdown
**File:** `frontend/src/pages/OnrampPage.tsx`  
On the review step, show a live countdown timer until the quote expires (5 minutes).  
Use `useEffect` + `setInterval`. When it hits 0, show a "Quote expired — get a new one" message.  
**Skills:** React hooks

---

### GFI-004: Add `/health` endpoint tests
**File:** `backend/src/__tests__/health.test.ts` (create it)  
Write a Jest test that calls `GET /health` and asserts `{ status: 'ok' }`.  
**Skills:** Jest, supertest

---

### GFI-005: Add `VITE_STELLAR_NETWORK` badge to the UI
**File:** `frontend/src/components/Layout.tsx`  
Show a small "Testnet" or "Mainnet" badge in the header based on `import.meta.env.VITE_STELLAR_NETWORK`.  
**Skills:** React, Tailwind

---

## 🟡 Intermediate

### GFI-006: Implement Paystack provider skeleton
**File:** `backend/src/providers/PaystackProvider.ts` (create it)  
Extend `PaymentProvider`. Use the [Paystack API docs](https://paystack.com/docs/api/) to implement `initiatePayment` and `verifyPayment`.  
Leave `handleWebhook` with a TODO for signature verification.  
**Skills:** TypeScript, REST APIs

---

### GFI-007: Add rate caching
**File:** `backend/src/services/rateService.ts`  
Add a simple in-memory TTL cache (60 seconds) so repeated quote requests don't recompute rates.  
In a follow-up, this can be replaced with Redis.  
**Skills:** TypeScript, caching patterns

---

### GFI-008: Add input validation for Stellar address on the backend
**File:** `backend/src/routes/onramp.ts`  
The `destinationAddress` field in `IntentSchema` currently only checks length.  
Use the Stellar SDK's `StrKey.isValidEd25519PublicKey()` to validate it properly.  
**Skills:** TypeScript, Stellar SDK

---

### GFI-009: Add a "copy address" button to ConnectPage
**File:** `frontend/src/pages/ConnectPage.tsx`  
After connecting, show the connected address with a copy-to-clipboard button.  
**Skills:** React, browser clipboard API

---

### GFI-010: Write a `docker-compose.yml`
**File:** `docker-compose.yml` (create at root)  
Define services for `backend`, `frontend`, and `postgres`.  
Use environment variables from `.env.example`.  
**Skills:** Docker, docker-compose

---

## 🔴 Advanced

### GFI-011: Implement SEP-10 Web Authentication
Add a `GET /auth` and `POST /auth` endpoint following the [SEP-10 spec](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md).  
This enables anchor-compatible authentication.  
**Skills:** Stellar SDK, JWT, cryptography

---

### GFI-012: Add path payment support
**File:** `backend/src/stellar/index.ts`  
Implement `sendPathPayment()` using `Operation.pathPaymentStrictReceive`.  
This enables cross-asset conversion via the Stellar DEX.  
**Skills:** Stellar SDK, DEX mechanics

---

### GFI-013: Add BullMQ job queue for Stellar disbursements
Replace the direct `sendPayment()` call in `onrampService.ts` with a BullMQ job.  
Add retry logic with exponential backoff.  
**Skills:** Node.js, Redis, BullMQ, queue patterns

---

## How to Claim an Issue

1. Comment on the GitHub issue: "I'd like to work on this"
2. Fork the repo and create a branch: `git checkout -b gfi/001-inr-support`
3. Make your changes, add tests if applicable
4. Open a PR referencing the issue: `Closes #GFI-001`

Questions? Open a Discussion or ask in the PR.
