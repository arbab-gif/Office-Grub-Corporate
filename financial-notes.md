# Design Note — Financial Module

Restaurant-portal **Financial** section (`financial.html` · `financial.css`, reuses `dashboard.css` components). A restaurant-friendly view of earnings, fees, payouts and milestones — *transparency, not accounting software*. Implements v3 billing rules (§3C–3F) in plain language.

---

## 1. Information architecture

`Financial` is one sidebar item (`figma-nav.js` → `financial`). Inside, a horizontal **sub-nav** (pill tabs, scrolls on overflow) switches 8 panels — no page reloads, deep-linkable via `#hash`:

```
Financial
├── Overview            ← financial health at a glance
├── Payouts             ← statements + payout history
├── Commission & Tier   ← visual tier journey (hex stepper)
├── Performance         ← 3 scores + tier impact
├── Threshold           ← $15,000 milestone progress
├── Reservation Fees    ← $0.95/guest, Net-30 invoices
├── Live Kitchen        ← 20% commission, event settlements
└── Transactions        ← filterable ledger
```
The **Restaurant Setup Fee** ($99, one-time) lives on the Overview and in Transactions — it's a fact, not a section.

## 2. Primary user flows

- **"Did I get paid / when?"** → Overview (Available Balance + Upcoming Payout) → Payouts (statement, Download, status).
- **"Why is my payout this amount?"** → Payouts statement: Gross → each deduction on its own line → Net. Every fee is separate and labeled.
- **"How do I pay less commission?"** → Commission & Tier (journey + next milestone) → Performance (keep 3 scores ≥95%).
- **"How close am I to the milestone?"** → Threshold progress bar.
- **"Show me one charge"** → Transactions, filter by type/status/date.

## 3. Screens & key components (reused for consistency)

| Panel | Components |
|---|---|
| Overview | 4 KPI cards (`.fin-kpi`), fee breakdown (`.fee-list`/`.fee-total`), setup-fee card |
| Payouts | Statement (`.pay-*` from dashboard), history table (`.dh-table`), Download/View actions |
| Commission & Tier | Hex stepper (`.cs-*`), rate hero, next-milestone note, benefits list |
| Performance | 3 factor bars (`.perf-*`, 95% gate marker), "on track" badge, meaning + tips |
| Threshold | Progress bar (`.thr-*`), rules note |
| Reservation Fees | 3 KPI cards, monthly invoice table, Net-30 note |
| Live Kitchen | Event flow hero (`.lk-event`: gross − 20% = earnings), event table |
| Transactions | Filters (type/status/date/search), ledger with +/− colored amounts |

Shared vocabulary: status badges (`.fin-badge` — paid/scheduled/pending/due), notes/callouts (`.fin-note`), toast on Download.

## 4. States

- **Empty** (`.fin-empty`) — Transactions when filters match nothing: 🔍 + "No transactions match your filters. Try clearing the filters or picking a different date range." (Wire the same for a brand-new restaurant with no payouts yet: "Your first payout will appear here after your first delivery week.")
- **Loading** (`.skel`) — shimmer class to drop on KPI values / table rows while fetching. Apply to `.k-v`, `.dh-table td`, or whole cards.
- **Error** (`.fin-error`) — inline red banner with **Retry** (built on the Transactions panel; reuse per panel). Copy: "We couldn't load your latest transactions. Please try again." Never show a stack trace or code.
- **Loaded** — default.

## 5. Mobile / responsive

- `@1100px`: KPI/columns collapse to 2-up.
- `@720px`: single column; sub-nav stays a horizontal scroll strip; the Live Kitchen `gross − commission = earnings` flow stacks vertically; search fields go full-width; tables scroll horizontally inside `.dh-scroll`.
- Touch targets ≥40px; the sub-nav is swipeable.

## 6. UX copy principles (what we did / didn't say)

**Plain language, no billing jargon.** Say *"your current total rate"*, *"keep your performance strong"*, *"$3,760 to go"*, *"you keep the rest."* 
**Never shown to restaurants:** "eligibility threshold", "commission engine", "accumulation logic", tier "trigger conditions". Those stay in the backend / `commission-notes.md`.

Anchor copy per panel:
- Overview: "Your earnings, fees, payouts and milestones — all in one place."
- Gross sales: "Calculated **before** any deductions."
- Payouts: "Payouts are sent by direct deposit on the 15th… platform fee and commission are always separate lines."
- Tier: "Keep your performance strong to reach Q4, where your total rate drops to just 10%."
- Performance: "Your performance is on track to maintain your current tier."
- Threshold: "When you pass $15,000 in food sales, you become a long-term partner at a steady 19% total rate… it never resets."
- Reservation: "$0.95 per guest… billed Net-30 and kept separate from your food-sales payouts."
- Live Kitchen: "Office Grubb takes a 20% commission… you keep the rest."

## 7. Business rules encoded (must stay true)

- **Platform fee 10%, permanent**, calculated first, always its own line. Two separate charges (platform + commission) — never merged.
- **Commission ladder:** Q1 25 → Q2 20 → Q3 15 → Q4 10 → post-$15k 19% (total). Demo restaurant is at **Q3**.
- **$15k threshold:** gross food sales only; **excludes** platform fees, reservation fees, and Live Kitchen; only accumulates at Q4+; crossed once; never resets.
- **Reservation fee:** $0.95/guest, Net-30, separate invoice (design-only Phase 1).
- **Live Kitchen:** 20% of gross + **$800/day minimum**; own settlement statement.
- **Setup fee:** one-time $99 activation.
- **Adjustments:** refunds charged to the restaurant for order issues (e.g. wrong item) and credits back in its favor (e.g. goodwill). Shown as a **net line on the statement, itemized** below it, carried into the payout-history **Adjustments column**, and logged in Transactions as type **Adjustment** (negative = refund, positive = credit). Demo July = −$45 refund + $25 credit = −$20 net → Net Payout $8,185. Never merge adjustments into the fee lines — restaurants must see each one and why.

## 8. Backend / TODO

- All figures are **seeded demo data** — wire to real payout/ledger APIs (see the payload shape in `commission-notes.md` §7 and extend with `availableBalance`, `payouts[]`, `reservationInvoices[]`, `liveKitchenEvents[]`, `transactions[]`).
- Download Statement currently toasts — hook to real PDF generation. (Publishing/emailing a statement is an external action — gate behind confirmation.)
- Reservation module is **design-only** in Phase 1 (no live collection) — keep the label until backend lands.
- Reconcile the demo Threshold value ($11,240) with the Dashboard's separate state if both are shown to the same restaurant.

See also: `commission-notes.md`, `commission-stepper-notes.md`, [[officegrubb-canonical-rules]] (memory).
