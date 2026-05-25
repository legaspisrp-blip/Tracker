# Ledger · Personal Finance Dashboard

A real working personal-finance app. Track expenses, income, debts, credit utilization, budgets, goals, and forecasts. All numbers are computed live from data you enter — there is no fake or seed data. Data persists locally in your browser via `localStorage`.

---

## Quick start

This is a static-site app — no build step, no framework CLI, no `npm install`. Open `index.html` and you're running.

### Run locally

```bash
# Recommended — serve over http to avoid file:// quirks
python3 -m http.server 8080
# then visit http://localhost:8080
```

### Deploy on GitHub Pages

1. Push this folder to a new GitHub repo (e.g. `ledger-app`).
2. **Settings → Pages → Source**: `Deploy from a branch` → `main` / root.
3. Save. Live at `https://<username>.github.io/ledger-app/` in ~1 minute.

### Deploy on Vercel / Netlify

Drop the folder in or import the repo. Framework preset: **Other**. Build command: *(empty)*. Output directory: *(empty)*. Deploy.

---

## How it works

### Single source of truth
All app state lives in one object managed by a React reducer (`store.jsx`). Every change runs through `dispatch()` and is auto-persisted to `localStorage` (key `ledger:state:v2`).

### Real computations
The `computed` slice in `useStore()` recomputes derived values (cash on hand, savings rate, DTI, health score, upcoming bills, etc.) every render via `useMemo`. No stale numbers anywhere.

### Reversible transactions
Adding / editing / deleting a transaction correctly applies, reverses, and re-applies its effect on the linked cash account, debt counter, and credit balance. No drift.

### Auto-recurring rules
Monthly recurring rules auto-generate a transaction on the first render of the month at or past their `dueDay`. They only fire once per month.

---

## Features

| Screen | What it does |
|---|---|
| **Overview** | KPI ticker · 6-month cashflow chart · upcoming bills · by-category spend · debt summary · goal previews · recent transactions |
| **Cash Checker** | Survival-runway number · safety score · 30-day cash vs obligations · account breakdown |
| **Transactions / Expenses / Income** | Full CRUD · search · filter (date range, category, account) · CSV export |
| **Calendar** | Dynamic month/year navigation · agenda view · debts + recurring + credit cycles + actuals overlaid |
| **Debt** | Per-debt CRUD · snowball / avalanche / due-date sorting · live payoff calculator with months-saved & interest-avoided |
| **Credit** | Per-line CRUD · utilization analyzer · "Record payment" flow (reduces balance + creates linked tx) · pay-to-30% recommendations |
| **Health & Loan** | Composite 0–100 health score · 4 sub-scores · loan eligibility simulator with live amortization, DTI projection, risk level |
| **Forecast** | USD↔PHP editable rate · best/safe/risk scenarios · 60-day cash trajectory · expected-income CRUD · upcoming obligations |
| **Money Coach** | Rule-based real analysis of your data — warnings, recommendations, wins. Spending patterns, DTI, util, savings rate, budget overruns |
| **Budgets** | Per-category caps · pacing · projected close · over-budget chips |
| **Goals** | Targets · contributions · deadlines · progress bars |
| **Recurring** | Monthly rules · auto-generate transactions · last-run timestamp |
| **Reports** | 4 tabs: Personal Income Statement · Personal Ledger · Full Cash Flow Report · Financial Health Summary · Print/Save as PDF · CSV export |
| **Settings** | Profile · Appearance (variant A/B, light/dark, accent) · Categories CRUD · Cash accounts CRUD · Data backup/restore/reset |

---

## File map

```
ledger/
├── index.html                    # Entry · loads React + Babel + all scripts
├── README.md                     # This file
├── theme.jsx                     # Variants A (Terminal) + B (Quiet Ledger), light/dark palettes
├── store.jsx                     # Reducer, actions, localStorage persistence, computed slice
├── ui.jsx                        # Panel, Button, Modal, Input, Field, Toast, Empty, Chip, etc.
├── charts.jsx                    # AreaChart SVG primitive
├── shell.jsx                     # Sidebar, Topbar, PageHeader, role permissions
├── login.jsx                     # Two-role sign-in
├── app.jsx                       # Root: routing, theme application, screen switcher
├── screens-transactions.jsx      # Transactions / Expenses / Income + TransactionForm + filter
├── screens-overview.jsx          # Overview dashboard + Cash Checker + DonutMini
├── screens-calendar.jsx          # Month + agenda views
├── screens-debt.jsx              # Debt + Credit + Payoff calculator + payment flows
├── screens-plan.jsx              # Budgets + Goals + Recurring rules
├── screens-analyze.jsx           # Health & Loan + Forecast + Money Coach
├── screens-reports.jsx           # 4-tab monthly reports + print stylesheet
└── screens-settings.jsx          # Profile + Appearance + Categories + Accounts + Data ops
```

---

## How to edit common things

### Change the default categories

Edit `EMPTY_STATE.categories` in `store.jsx` (line ~30). Or use the Settings → Categories screen at runtime.

### Add a new screen

1. Create the component, register it on `window` at the bottom of its file.
2. Add a NAV entry in `shell.jsx` (with `group` and `icon` keys).
3. Add the screen ID to the appropriate role's `canSee` array in `shell.jsx · ROLE_PERMS`.
4. Wire it into the `<App>` router in `app.jsx`.

### Add a new icon

Add a path to `ICONS` in `ui.jsx`. Reference by key in `<Glyph d={ICONS.yourKey} />`.

### Change the palette

`theme.jsx · PALETTES` — four palettes (`a-light`, `a-dark`, `b-light`, `b-dark`). Edit hex / oklch values.

### Change the default FX rate

`EMPTY_STATE.settings.fxRate` in `store.jsx`. Users override it from the Forecast screen.

---

## Architecture notes

### Why no framework / build step
Static HTML + CDN React + inline JSX via Babel-standalone. Pros: zero dependencies, deploys anywhere, anyone can clone and run in 30 seconds. Cons: Babel-in-browser is slower than a Vite build. For 18 files of <50KB each it's a non-issue. When you outgrow it, move to Vite — the files port over cleanly.

### Why globals over imports
Each `<script type="text/babel">` gets its own scope. We stash exports on `window` at the bottom of each file. It's not pretty, but it keeps the file count small and the deployment trivial.

### Why a reducer instead of Zustand/Redux
React's built-in `useReducer` is enough for this size of app. No external state library to learn. The shape and actions are designed to be drop-in compatible with Supabase/Firebase RPC calls when you want server state.

---

## What's still a prototype

Honest list, so there are no surprises:

1. **No real auth.** Login is role selection. Both roles share the same browser-local data. For separate accounts across devices, swap the persistence layer in `store.jsx` for Supabase or Firebase Auth + Firestore. The store actions stay the same.
2. **No PDF export library.** "Print / Save as PDF" uses the browser's print dialog with a print stylesheet. For polished branded PDFs, integrate `react-pdf` or `jsPDF`.
3. **FX rate is manual.** No live exchange-rate fetch. Endpoint to wire: `https://api.frankfurter.app/latest?from=USD&to=PHP` (free, no key). 5 lines of code.
4. **No backend.** localStorage only. The Settings → Data → Backup/Restore is your safety net. Wire Supabase for true cloud sync.

### Recommended next steps when you go production

| Need | Drop-in choice |
|---|---|
| Real auth + per-user data | **Supabase** (Postgres + Row-Level Security + Auth) |
| Live FX rate | `frankfurter.app` or `exchangerate.host` |
| Polished PDF | `react-pdf` or browser-side `jsPDF + html2canvas` |
| Hot reload + TypeScript | **Vite** — files port over with minor adjustments |
| Mobile app | **Capacitor** wraps this same code as iOS/Android |

---

## Roles

| Role | Sees |
|---|---|
| **Owner** | All 16 screens · full CRUD · settings |
| **Assistant** | Transactions · Expenses · Income · Calendar · Recurring · Settings (no analytics, debt, credit, reports, forecast) |

Switch role: sign out from the sidebar's user card.

---

## License

Personal use. No license declared — add your own (MIT recommended) before publishing.
