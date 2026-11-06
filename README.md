# RevScope — ASC 606 Revenue Recognition Platform

Enterprise-grade revenue recognition and compliance platform for B2B SaaS finance teams. Built to the ASC 606 / IFRS 15 five-step framework.

## Features

- **Contract Management** — sortable/filterable contract list, contract detail with full header, PO panel, and modification history
- **Performance Obligation Engine** — SSP-ratio allocation calculator showing the math; variable consideration with constraint methods; cumulative catch-up and prospective modification treatment
- **Recognition Schedule** — 24-month per-PO waterfall chart; point-in-time vs over-time toggle per PO; journal entry preview; deferred revenue rollforward
- **Compliance Dashboard** — per-contract ASC 606 five-step checklist with green/amber/red status; contracts-requiring-attention panel; full timestamped audit trail
- **Portfolio Dashboard** — ARR, Recognized YTD, Deferred Balance KPIs; recognition waterfall; PO-type breakdown donut

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- React Router v6
- Recharts
- date-fns, Sonner, Lucide React

## Setup

```bash
npm install
npm run dev      # development server at localhost:5173
npm run build    # production build → dist/
```

## Routes

| Route | Page |
|-------|------|
| `/` | Portfolio Dashboard |
| `/contracts` | Contract list |
| `/contracts/new` | New contract form |
| `/contracts/:id` | Contract detail + schedule |
| `/recognition` | Portfolio recognition view |
| `/compliance` | Compliance + audit trail |

## Seed Data

12 realistic SaaS contracts across 6 customers (Meridian Healthcare, Apex Manufacturing, Cascade Financial, TerraLogic Inc, Sterling Capital, NovaBridge Corp). TCV ranges from $45K to $2.4M. 3 contracts in Modified state with catch-up adjustments. All allocations, recognition schedules, and KPIs derive from the same seed data.

## Persistence

User-created contracts and audit events persist to `localStorage`. Use the **Reset Demo Data** button on the Compliance page to restore the original seed data.

## Mocked / Simulated

- No real backend — all data is in-memory / localStorage
- Recognition calculations use straight-line amortization and point-in-time delivery; real production systems may use more complex methods
- Journal entry preview is illustrative; no GL integration

## Deploy to Vercel

```bash
vercel deploy --prod
```

The included `vercel.json` rewrites all routes to `/index.html` for SPA routing.
