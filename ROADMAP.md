# Roadmap

StellarOnRamp Lite is designed to grow from a developer reference into production-grade infrastructure.

---

## v0.1 — Foundation ✅ (current)

- [x] Modular payment provider interface
- [x] Mock provider with auto-fulfillment
- [x] Stellar SDK integration (XLM + USDC)
- [x] Quote engine with fee breakdown
- [x] 4-step onramp flow (React)
- [x] Freighter wallet integration
- [x] Dashboard with balance + history
- [x] PostgreSQL persistence
- [x] Webhook handler skeleton

---

## v0.2 — Real Providers

- [ ] Flutterwave provider (NGN, KES, GHS)
- [ ] Paystack provider (NGN, GHS)
- [ ] M-Pesa provider (KES)
- [ ] Webhook signature verification
- [ ] Provider health checks
- [ ] Rate caching with Redis

---

## v0.3 — SEP Compliance

- [ ] SEP-6 (Deposit and Withdrawal API)
- [ ] SEP-24 (Interactive Deposit/Withdrawal)
- [ ] SEP-10 (Stellar Web Authentication)
- [ ] SEP-12 (KYC API integration)
- [ ] Anchor integration guide

---

## v0.4 — Production Hardening

- [ ] Docker + docker-compose
- [ ] Kubernetes Helm chart
- [ ] Rate limiting per user
- [ ] Idempotency keys on all mutations
- [ ] Distributed queue for Stellar disbursements (BullMQ)
- [ ] Retry logic with exponential backoff
- [ ] Alerting (Sentry, PagerDuty)

---

## v0.5 — UX & Accessibility

- [ ] Mobile-first redesign
- [ ] i18n: English, French, Swahili, Portuguese, Tagalog
- [ ] SMS-based flow (no browser required)
- [ ] Progressive Web App (PWA)
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## v1.0 — Ecosystem

- [ ] Hosted demo environment
- [ ] One-click Railway / Render deploy
- [ ] Provider marketplace (community-contributed)
- [ ] Stellar ecosystem grant application
- [ ] Audit by security firm

---

## Ideas Under Consideration

- Path payment optimization via Stellar DEX
- Multi-hop cross-border flows (NGN → XLM → PHP)
- Savings/yield layer via Stellar AMM
- Mobile SDK (React Native)
- Compliance module (AML screening)

---

Want to work on any of these? See [GOOD_FIRST_ISSUES.md](GOOD_FIRST_ISSUES.md) or open a discussion.
