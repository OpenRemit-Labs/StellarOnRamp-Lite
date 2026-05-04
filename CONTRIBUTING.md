# Contributing to StellarOnRamp Lite

Thank you for helping build open financial infrastructure. Every contribution matters.

---

## Ways to Contribute

- **Bug fixes** — Open an issue, then a PR
- **New payment providers** — Flutterwave, Paystack, M-Pesa, Xendit, etc.
- **New fiat currencies** — Add rates and test coverage
- **UI improvements** — Mobile UX, accessibility, i18n
- **Documentation** — Guides, translations, examples
- **Tests** — Unit and integration coverage

---

## Development Setup

```bash
git clone https://github.com/your-org/stellar-onramp-lite.git
cd stellar-onramp-lite
npm run install:all

# Backend
cd backend && cp .env.example .env && npm run dev

# Frontend (new terminal)
cd frontend && npm run dev
```

---

## Adding a Payment Provider

1. Create `backend/src/providers/YourProvider.ts`
2. Extend `PaymentProvider` and implement all three methods
3. Register in `backend/src/providers/index.ts`
4. Add your currency to `rateService.ts` if needed
5. Write tests in `backend/src/__tests__/`
6. Update README with provider name

---

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Include a clear description of what changed and why
- Add or update tests for your changes
- Run `npm run build` in both `backend/` and `frontend/` before submitting
- Reference any related issues with `Closes #123`

---

## Code Style

- TypeScript strict mode — no `any` without justification
- Zod for all API input validation
- No secrets in code — use environment variables
- Prefer explicit types over inference for public APIs

---

## Reporting Issues

Use GitHub Issues. Include:
- Steps to reproduce
- Expected vs actual behavior
- Node.js version, OS
- Relevant logs

---

## Code of Conduct

Be respectful. This project serves communities that are often underserved by financial systems — keep that mission central.
