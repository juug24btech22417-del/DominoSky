# Contributing to Domino Sky

Thank you for your interest in contributing to **Domino Sky — Network Operations Intelligence**!

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Quality Standards](#code-quality-standards)
- [Testing](#testing)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Security](#security)
- [Pull Request Process](#pull-request-process)

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/juug24btech22417-del/DominoSky.git
cd DominoSky

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Run the test suite
npm test

# 5. Build for production
npm run build
```

**Prerequisites:** Node.js 20+, npm 10+.

---

## Project Structure

```
src/
├── engine/              # Deterministic simulation core (zero dependencies)
│   ├── simulator.ts     # Main simulation engine — aircraft/crew/pax cascade
│   ├── recovery.ts      # AI recovery option evaluator (re-runs sim with overrides)
│   └── aiDispatcher.ts  # Tactical briefing generator (pure function)
├── store/
│   └── useSimulationStore.ts  # Zustand global state (simulation + UI)
├── components/          # React UI components (read-only view of store state)
├── types/               # Shared TypeScript interfaces and enums
├── data/                # domino_dataset.json — 70 flights, 16 airports, 16 tails
└── __tests__/           # Vitest unit tests (mirror src/engine/)
```

---

## Development Workflow

1. **Branch off `main`** for every change:
   ```bash
   git checkout -b feat/my-feature
   ```
2. **Never commit directly to `main`**.
3. Run `npm run build` and `npm test` before every commit — both must exit 0.
4. Run `npx oxlint src/` and fix all warnings before opening a PR.

---

## Code Quality Standards

- **TypeScript strict mode is enabled.** All code must pass `tsc -b` with zero errors.
- **JSDoc required** on all exported functions in `src/engine/` and `src/store/`.
- **No magic numbers** — extract named constants instead.
- **No `any` types** — use proper interfaces from `src/types/`.
- **No `console.log`** in production paths — use the event log in `SimulationOutput.events`.
- Follow the **Single Responsibility Principle**: engine files are pure functions; components only read store state.

---

## Testing

We use [Vitest](https://vitest.dev/) with zero external test infrastructure.

```bash
npm test          # Run all tests once
npm test -- --watch   # Watch mode
```

**Coverage targets:**
- `src/engine/simulator.ts` — 100% function coverage
- `src/engine/recovery.ts`  — 100% function coverage
- `src/engine/aiDispatcher.ts` — 100% function coverage

**Test file naming:** `src/__tests__/<module>.test.ts` mirrors the source module.

**What to test:**
- Pure math utilities (`toMinutes`, `toHHMM`)
- Nominal schedule invariants (70 flights, 0 delays, health = 100)
- Cascade propagation (closure → tail → crew → pax)
- Recovery delta correctness (after ≤ before for all metrics)
- Schema completeness (all required fields present on output objects)

---

## Accessibility Guidelines

All UI changes must comply with **WCAG 2.1 Level AA**:

- Every interactive element needs an `aria-label` or visible label.
- Modal dialogs need `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
- Keyboard navigation must be possible without a mouse (use `onKeyDown` handlers).
- Use semantic HTML (`<main>`, `<nav>`, `<section>`, `<button>`) over `<div>` where possible.
- Respect `prefers-reduced-motion` — do not add new CSS animations without a `@media (prefers-reduced-motion: reduce)` override.
- Color contrast must meet 4.5:1 for normal text, 3:1 for large text (WCAG 1.4.3).

---

## Security

- **No `eval()`, `new Function()`, or `dangerouslySetInnerHTML`** anywhere in the codebase.
- All user inputs must be validated and sanitized before use in any computation.
- Dependencies must pass `npm audit` with 0 vulnerabilities before merging.
- Never commit secrets, API keys, or credentials — see [SECURITY.md](SECURITY.md).
- The CSP in `index.html` must not be weakened without documented justification.

---

## Pull Request Process

1. Ensure `npm run build` exits 0 (no TypeScript errors).
2. Ensure `npm test` exits 0 (all tests pass).
3. Ensure `npx oxlint src/` reports 0 errors.
4. Update relevant JSDoc if you change function signatures.
5. Add or update tests for any new engine logic.
6. Reference the relevant issue in your PR description.

> **Note:** PRs that lower test coverage, introduce `any` types, or add accessibility regressions will not be merged.

---

*Built for the Indian Aviation Hackathon. Deterministic. Testable. Accessible.*
